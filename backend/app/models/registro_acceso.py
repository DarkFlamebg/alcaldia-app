from app.core.database import Database
from app.core.model import Model


class RegistroAcceso(Model):
    """Cada intento de inicio de sesión, exitoso o no."""

    table = "registro_accesos"
    fillable = ("usuario_id", "email_intentado", "exitoso", "ip", "user_agent")

    @classmethod
    def registrar(cls, email: str, exitoso: bool, ip: str | None, user_agent: str | None,
                  usuario_id: int | None = None) -> None:
        cls.create({
            "usuario_id": usuario_id,
            "email_intentado": email[:150],
            "exitoso": exitoso,
            "ip": (ip or "")[:45] or None,
            "user_agent": (user_agent or "")[:255] or None,
        })

    @classmethod
    def fallos_recientes(cls, columna: str, valor: str, minutos: int) -> int:
        """Intentos fallidos en los últimos `minutos` para una IP o un email."""
        if columna not in ("ip", "email_intentado"):
            raise ValueError(columna)
        fila = Database.fetch_one(
            f"""
            SELECT COUNT(*) AS total FROM registro_accesos
            WHERE {columna} = :valor AND exitoso = FALSE
              AND creado_en >= NOW() - INTERVAL :minutos MINUTE
            """,
            {"valor": valor, "minutos": minutos},
        )
        return int(fila["total"])
