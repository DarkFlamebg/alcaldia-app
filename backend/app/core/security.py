"""Contraseñas, sesión, CSRF y control de permisos.

Cómo se autentica el panel de React:
1. React pide un token CSRF a GET /api/auth/csrf.
2. Envía email y contraseña a POST /api/auth/login con el header X-CSRF-Token.
3. El backend guarda el id del usuario en una cookie de sesión firmada y
   HttpOnly (JavaScript no puede leerla).
4. Toda petición que modifica datos (POST, PUT, PATCH, DELETE) debe llevar el
   header X-CSRF-Token. Un sitio externo no puede leer ese token, así que no
   puede hacer cambios en nombre del administrador.
"""

import hmac
import secrets
from collections.abc import Callable

import bcrypt
from fastapi import Depends, HTTPException, Request


class PasswordHasher:
    """Hash de contraseñas con bcrypt. bcrypt solo usa los primeros 72 bytes."""

    MAX_BYTES = 72
    _hash_falso: str | None = None

    @staticmethod
    def hash(plano: str) -> str:
        return bcrypt.hashpw(plano.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("ascii")

    @staticmethod
    def verify(plano: str, hashed: str) -> bool:
        try:
            return bcrypt.checkpw(plano.encode("utf-8"), hashed.encode("ascii"))
        except ValueError:
            return False

    @classmethod
    def verify_falso(cls, plano: str) -> None:
        """Gasta el mismo tiempo que una verificación real cuando el email no existe,
        para que no se pueda adivinar qué correos están registrados."""
        if cls._hash_falso is None:
            cls._hash_falso = cls.hash(secrets.token_urlsafe(16))
        cls.verify(plano, cls._hash_falso)


class Csrf:
    SESSION_KEY = "_csrf"
    HEADER = "X-CSRF-Token"
    METODOS_SEGUROS = ("GET", "HEAD", "OPTIONS")

    @classmethod
    def token(cls, request: Request) -> str:
        token = request.session.get(cls.SESSION_KEY)
        if not token:
            token = secrets.token_urlsafe(32)
            request.session[cls.SESSION_KEY] = token
        return token

    @classmethod
    def verificar(cls, request: Request) -> None:
        """Dependencia de FastAPI: rechaza cambios sin un token CSRF válido."""
        if request.method in cls.METODOS_SEGUROS:
            return
        esperado = request.session.get(cls.SESSION_KEY)
        enviado = request.headers.get(cls.HEADER, "")
        if not esperado or not enviado or not hmac.compare_digest(esperado, enviado):
            raise HTTPException(status_code=403, detail="Token CSRF inválido. Recarga la página e inténtalo de nuevo.")


class Auth:
    SESSION_KEY = "usuario_id"

    @classmethod
    def login(cls, request: Request, usuario: dict) -> None:
        # Se borra la sesión anterior (y su token CSRF) para evitar fijación de sesión.
        request.session.clear()
        request.session[cls.SESSION_KEY] = usuario["id"]
        cls._olvidar(request)

    @classmethod
    def logout(cls, request: Request) -> None:
        request.session.clear()
        cls._olvidar(request)

    @staticmethod
    def _olvidar(request: Request) -> None:
        """Borra el usuario guardado en caché para esta petición."""
        if hasattr(request.state, "usuario"):
            del request.state.usuario

    @classmethod
    def user(cls, request: Request) -> dict | None:
        """Usuario de la sesión actual (sin el hash de contraseña), o None."""
        if hasattr(request.state, "usuario"):
            return request.state.usuario

        from app.models.usuario import Usuario  # import local para evitar ciclos

        usuario = None
        usuario_id = request.session.get(cls.SESSION_KEY)
        if usuario_id:
            fila = Usuario.con_rol(int(usuario_id))
            if fila and fila["activo"] and fila["rol_activo"]:
                fila.pop("password_hash", None)
                fila["permisos"] = Usuario.permisos(fila["id"])
                usuario = fila
            else:
                request.session.clear()
        request.state.usuario = usuario
        return usuario


def require_login(request: Request) -> dict:
    usuario = Auth.user(request)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Inicia sesión para continuar.")
    return usuario


def require_permiso(*codigos: str) -> Callable[..., dict]:
    """Dependencia: exige que el rol del usuario tenga todos estos permisos."""

    def dependencia(usuario: dict = Depends(require_login)) -> dict:
        if not set(codigos) <= usuario["permisos"]:
            raise HTTPException(status_code=403, detail="No tienes permiso para realizar esta acción.")
        return usuario

    return dependencia


def tiene_permiso(usuario: dict, codigo: str) -> bool:
    return codigo in usuario["permisos"]
