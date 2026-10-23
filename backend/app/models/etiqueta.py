"""Etiquetas de las noticias.

Se guardan en su propia tabla (`etiquetas`) y se enlazan con las noticias por
la tabla intermedia `noticia_etiqueta` (relación muchos a muchos). Así una
etiqueta como "Cultura" existe una sola vez y se puede buscar, contar y
filtrar con JOINs.
"""

from sqlalchemy.engine import Connection

from app.core.database import Database
from app.core.model import Model
from app.core.text import limpiar_espacios, slugify


class Etiqueta(Model):
    table = "etiquetas"
    fillable = ("nombre", "slug")

    MAX_POR_NOTICIA = 10
    MAX_LARGO = 50  # etiquetas.nombre es VARCHAR(50)

    @classmethod
    def parsear(cls, texto: str) -> list[str]:
        """'Cultura, eventos ,CULTURA' -> ['Cultura', 'eventos'] (sin repetidos)."""
        nombres: list[str] = []
        vistos: set[str] = set()
        for parte in texto.split(","):
            nombre = limpiar_espacios(parte)[: cls.MAX_LARGO]
            slug = slugify(nombre)
            if slug and slug not in vistos:
                vistos.add(slug)
                nombres.append(nombre)
        return nombres

    @classmethod
    def obtener_o_crear(cls, nombre: str, conn: Connection) -> int:
        slug = slugify(nombre)
        fila = Database.fetch_one("SELECT id FROM etiquetas WHERE slug = :slug", {"slug": slug}, conn)
        if fila:
            return fila["id"]
        return cls.create({"nombre": nombre, "slug": slug}, conn)

    @classmethod
    def sincronizar(cls, noticia_id: int, nombres: list[str], conn: Connection) -> None:
        """Deja la noticia enlazada exactamente con estas etiquetas."""
        Database.execute("DELETE FROM noticia_etiqueta WHERE noticia_id = :id", {"id": noticia_id}, conn)
        for nombre in nombres:
            etiqueta_id = cls.obtener_o_crear(nombre, conn)
            Database.execute(
                "INSERT IGNORE INTO noticia_etiqueta (noticia_id, etiqueta_id) VALUES (:n, :e)",
                {"n": noticia_id, "e": etiqueta_id},
                conn,
            )

    @classmethod
    def mas_usadas(cls, limite: int = 20) -> list[dict]:
        """Etiquetas ordenadas por cuántas noticias las usan (JOIN con la tabla intermedia)."""
        return Database.fetch_all(
            """
            SELECT e.id, e.nombre, e.slug, COUNT(ne.noticia_id) AS usos
            FROM etiquetas e
            INNER JOIN noticia_etiqueta ne ON ne.etiqueta_id = e.id
            INNER JOIN noticias n ON n.id = ne.noticia_id AND n.eliminado_en IS NULL
            GROUP BY e.id, e.nombre, e.slug
            ORDER BY usos DESC, e.nombre
            LIMIT :limite
            """,
            {"limite": limite},
        )
