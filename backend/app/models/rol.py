from app.core.database import Database
from app.core.model import Model


class Rol(Model):
    table = "roles"
    fillable = ("nombre", "descripcion", "activo")

    @classmethod
    def nombres(cls) -> list[str]:
        return [f["nombre"] for f in Database.fetch_all("SELECT nombre FROM roles WHERE activo = TRUE ORDER BY id")]

    @classmethod
    def id_por_nombre(cls, nombre: str) -> int | None:
        fila = Database.fetch_one("SELECT id FROM roles WHERE nombre = :nombre AND activo = TRUE", {"nombre": nombre})
        return fila["id"] if fila else None
