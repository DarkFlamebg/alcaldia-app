from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.security import Auth, Csrf, PasswordHasher
from app.models.auditoria import Auditoria, ip_de
from app.models.registro_acceso import RegistroAcceso
from app.models.usuario import Usuario
from app.views.usuario_view import UsuarioView


class LoginRequest(BaseModel):
    email: str = Field(max_length=150)
    password: str = Field(max_length=200)


class AuthController:
    """Inicio y cierre de sesión.

    Protección contra fuerza bruta (todo guardado en la base):
    - Cuenta: tras 5 contraseñas incorrectas seguidas se bloquea 15 minutos
      (usuarios.intentos_fallidos / bloqueado_hasta).
    - Email inexistente: 5 fallos en 15 minutos dan la misma respuesta, para no
      revelar qué correos existen (registro_accesos).
    - IP: 20 fallos en 15 minutos bloquean esa IP (registro_accesos).
    """

    MINUTOS_VENTANA = 15
    MAX_FALLOS_IP = 20

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/api/auth", tags=["auth"], dependencies=[Depends(Csrf.verificar)])
        self.router.add_api_route("/csrf", self.csrf, methods=["GET"])
        self.router.add_api_route("/me", self.me, methods=["GET"])
        self.router.add_api_route("/login", self.login, methods=["POST"])
        self.router.add_api_route("/logout", self.logout, methods=["POST"])

    async def csrf(self, request: Request) -> dict:
        return {"csrf_token": Csrf.token(request)}

    async def me(self, request: Request) -> dict:
        return {"usuario": UsuarioView.item(Auth.user(request)), "csrf_token": Csrf.token(request)}

    async def login(self, request: Request, datos: LoginRequest) -> dict:
        email = datos.email.strip().lower()
        ip = ip_de(request)
        user_agent = request.headers.get("user-agent")

        if ip and RegistroAcceso.fallos_recientes("ip", ip, self.MINUTOS_VENTANA) >= self.MAX_FALLOS_IP:
            self._demasiados_intentos()

        usuario = Usuario.buscar_por_email(email) if email else None
        if usuario is None:
            if RegistroAcceso.fallos_recientes("email_intentado", email, self.MINUTOS_VENTANA) >= Usuario.MAX_INTENTOS:
                self._demasiados_intentos()
            PasswordHasher.verify_falso(datos.password)
            RegistroAcceso.registrar(email, False, ip, user_agent)
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

        if usuario["segundos_bloqueo"] > 0:
            self._demasiados_intentos()

        if not PasswordHasher.verify(datos.password, usuario["password_hash"]) or not usuario["activo"] \
                or not usuario["rol_activo"]:
            Usuario.registrar_fallo(usuario["id"])
            RegistroAcceso.registrar(email, False, ip, user_agent, usuario["id"])
            Auditoria.registrar(request, "login_fallido", "usuarios", usuario["id"], usuario_id=usuario["id"])
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

        Auth.login(request, usuario)
        Usuario.registrar_acceso(usuario["id"])
        RegistroAcceso.registrar(email, True, ip, user_agent, usuario["id"])
        Auditoria.registrar(request, "login", "usuarios", usuario["id"], usuario_id=usuario["id"])
        # El login reinicia la sesión, así que React recibe un token CSRF nuevo.
        return {"usuario": UsuarioView.item(Auth.user(request)), "csrf_token": Csrf.token(request)}

    async def logout(self, request: Request) -> dict:
        usuario = Auth.user(request)
        if usuario:
            Auditoria.registrar(request, "logout", "usuarios", usuario["id"], usuario_id=usuario["id"])
        Auth.logout(request)
        return {"ok": True, "csrf_token": Csrf.token(request)}

    def _demasiados_intentos(self) -> None:
        raise HTTPException(
            status_code=429,
            detail=f"Demasiados intentos. Espera {self.MINUTOS_VENTANA} minutos e inténtalo de nuevo.",
        )
