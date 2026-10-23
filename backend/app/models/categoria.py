from app.core.database import Database
from app.core.model import Model


class Categoria(Model):
    table = "categorias"
    fillable = ("nombre", "slug", "orden", "activo")

    @classmethod
    def todas(cls) -> list[dict]:
        return Database.fetch_all("SELECT id, nombre, slug FROM categorias WHERE activo = TRUE ORDER BY orden, nombre")

    @classmethod
    def activa(cls, categoria_id: int) -> bool:
        return Database.fetch_one(
            "SELECT 1 FROM categorias WHERE id = :id AND activo = TRUE", {"id": categoria_id}
        ) is not None

    @classmethod
    def con_conteo(cls) -> list[dict]:
        """Categorías con cuántas noticias tienen en total y cuántas publicadas (LEFT JOIN)."""
        return Database.fetch_all(
            """
            SELECT c.id, c.nombre, c.slug,
                   COUNT(n.id) AS total_noticias,
                   COALESCE(SUM(n.estado = 'publicada'), 0) AS publicadas
            FROM categorias c
            LEFT JOIN noticias n ON n.categoria_id = c.id AND n.eliminado_en IS NULL
            WHERE c.activo = TRUE
            GROUP BY c.id, c.nombre, c.slug, c.orden
            ORDER BY c.orden, c.nombre
            """
        )
