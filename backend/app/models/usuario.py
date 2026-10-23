from app.core.database import Database
from app.core.model import Model


class Usuario(Model):
    table = "usuarios"
    fillable = (
        "rol_id", "nombre", "email", "password_hash", "activo", "debe_cambiar_clave",
        "intentos_fallidos", "bloqueado_hasta", "ultimo_acceso", "eliminado_en",
    )

    MAX_INTENTOS = 5
    MINUTOS_BLOQUEO = 15
    EMAIL_SISTEMA = "sistema@rafaelrangel.local"  # usuario interno de los datos de ejemplo

    # Usuario + nombre de su rol (JOIN). `segundos_bloqueo` se calcula con la hora
    # de MySQL para no depender de la zona horaria del servidor de Python.
    _SELECT = """
        SELECT u.*, r.nombre AS rol, r.activo AS rol_activo,
               GREATEST(COALESCE(TIMESTAMPDIFF(SECOND, NOW(), u.bloqueado_hasta), 0), 0) AS segundos_bloqueo
        FROM usuarios u
        INNER JOIN roles r ON r.id = u.rol_id
        WHERE u.eliminado_en IS NULL
    """

    @classmethod
    def buscar_por_email(cls, email: str) -> dict | None:
        return Database.fetch_one(f"{cls._SELECT} AND u.email = :email LIMIT 1", {"email": email.strip().lower()})

    @classmethod
    def con_rol(cls, usuario_id: int) -> dict | None:
        return Database.fetch_one(f"{cls._SELECT} AND u.id = :id", {"id": usuario_id})

    @classmethod
    def permisos(cls, usuario_id: int) -> set[str]:
        """Códigos de permiso del usuario según su rol (usuarios → roles → rol_permiso → permisos)."""
        filas = Database.fetch_all(
            """
            SELECT p.codigo
            FROM usuarios u
            INNER JOIN roles r        ON r.id = u.rol_id AND r.activo = TRUE
            INNER JOIN rol_permiso rp ON rp.rol_id = r.id
            INNER JOIN permisos p     ON p.id = rp.permiso_id
            WHERE u.id = :id
            """,
            {"id": usuario_id},
        )
        return {f["codigo"] for f in filas}

    @classmethod
    def registrar_fallo(cls, usuario_id: int) -> None:
        """Suma un intento fallido. Al llegar al máximo, bloquea la cuenta un rato."""
        Database.execute(
            """
            UPDATE usuarios
            SET bloqueado_hasta   = IF(intentos_fallidos + 1 >= :max, NOW() + INTERVAL :min MINUTE, bloqueado_hasta),
                intentos_fallidos = IF(intentos_fallidos + 1 >= :max, 0, intentos_fallidos + 1)
            WHERE id = :id
            """,
            {"id": usuario_id, "max": cls.MAX_INTENTOS, "min": cls.MINUTOS_BLOQUEO},
        )

    @classmethod
    def registrar_acceso(cls, usuario_id: int) -> None:
        Database.execute(
            "UPDATE usuarios SET ultimo_acceso = NOW(), intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = :id",
            {"id": usuario_id},
        )
