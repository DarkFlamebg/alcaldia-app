from datetime import datetime
from typing import Any

from app.core.database import Database
from app.core.model import Model
from app.core.pagination import Paginacion
from app.core.text import escapar_like, slugify
from app.models.etiqueta import Etiqueta


class Noticia(Model):
    table = "noticias"
    fillable = (
        "categoria_id", "titulo", "subtitulo", "slug", "contenido", "imagen", "autor",
        "destacada", "estado", "publicada_en", "creado_por", "actualizado_por", "eliminado_en",
    )

    ESTADOS = ("borrador", "publicada", "archivada")

    # Noticia + categoría + quién la creó + quién la editó por última vez + etiquetas,
    # en una sola consulta. Las noticias con borrado lógico (eliminado_en) no aparecen.
    _SELECT = """
        SELECT n.id, n.titulo, n.subtitulo, n.slug, n.contenido, n.imagen, n.autor,
               n.destacada, n.estado, n.publicada_en, n.creado_en, n.actualizado_en,
               n.categoria_id, n.creado_por, n.actualizado_por,
               c.nombre AS categoria_nombre, c.slug AS categoria_slug,
               uc.nombre AS creado_por_nombre,
               ua.nombre AS actualizado_por_nombre,
               GROUP_CONCAT(e.nombre ORDER BY e.nombre SEPARATOR ', ') AS etiquetas
        FROM noticias n
        INNER JOIN categorias c ON c.id = n.categoria_id
        INNER JOIN usuarios uc ON uc.id = n.creado_por
        LEFT JOIN usuarios ua ON ua.id = n.actualizado_por
        LEFT JOIN noticia_etiqueta ne ON ne.noticia_id = n.id
        LEFT JOIN etiquetas e ON e.id = ne.etiqueta_id
    """
    _GROUP_BY = " GROUP BY n.id, c.id, uc.id, ua.id "

    @classmethod
    def detalle(cls, noticia_id: int) -> dict | None:
        return Database.fetch_one(f"{cls._SELECT} WHERE n.id = :id AND n.eliminado_en IS NULL {cls._GROUP_BY}", {"id": noticia_id})

    @classmethod
    def listar(
        cls,
        q: str = "",
        categoria_id: int | None = None,
        estado: str | None = None,
        pagina: int = 1,
        por_pagina: int = 15,
    ) -> tuple[list[dict], Paginacion]:
        condiciones: list[str] = ["n.eliminado_en IS NULL"]
        params: dict[str, Any] = {}
        if q:
            condiciones.append("(n.titulo LIKE :q OR n.subtitulo LIKE :q)")
            params["q"] = f"%{escapar_like(q)}%"
        if categoria_id:
            condiciones.append("n.categoria_id = :categoria_id")
            params["categoria_id"] = categoria_id
        if estado in cls.ESTADOS:
            condiciones.append("n.estado = :estado")
            params["estado"] = estado
        where = f" WHERE {' AND '.join(condiciones)} "

        total = Database.fetch_one(f"SELECT COUNT(*) AS total FROM noticias n{where}", params)["total"]
        paginacion = Paginacion(pagina=pagina, por_pagina=por_pagina, total=total)
        if pagina > paginacion.paginas:
            paginacion = Paginacion(pagina=paginacion.paginas, por_pagina=por_pagina, total=total)

        filas = Database.fetch_all(
            f"{cls._SELECT}{where}{cls._GROUP_BY}"
            " ORDER BY COALESCE(n.publicada_en, n.creado_en) DESC, n.id DESC"
            " LIMIT :limite OFFSET :offset",
            {**params, "limite": por_pagina, "offset": paginacion.offset},
        )
        return filas, paginacion

    # ------------------------------------------------------------------
    # Consultas del portal público: solo noticias publicadas, no eliminadas
    # y de categorías activas. Si el admin despublica una noticia, deja de
    # aparecer en la siguiente carga de la página.
    # ------------------------------------------------------------------
    _VISIBLE = " n.estado = 'publicada' AND n.eliminado_en IS NULL AND c.activo = TRUE "
    _ORDEN_PUBLICO = " ORDER BY n.publicada_en DESC, n.id DESC "

    @classmethod
    def publicadas(
        cls,
        categoria_slug: str | None = None,
        etiqueta_slug: str | None = None,
        q: str = "",
        pagina: int = 1,
        por_pagina: int = 10,
    ) -> tuple[list[dict], Paginacion]:
        condiciones = [cls._VISIBLE]
        params: dict[str, Any] = {}
        if categoria_slug:
            condiciones.append("c.slug = :categoria")
            params["categoria"] = categoria_slug
        if etiqueta_slug:
            condiciones.append(
                "EXISTS (SELECT 1 FROM noticia_etiqueta ne2"
                " INNER JOIN etiquetas e2 ON e2.id = ne2.etiqueta_id"
                " WHERE ne2.noticia_id = n.id AND e2.slug = :etiqueta)"
            )
            params["etiqueta"] = etiqueta_slug
        if q:
            condiciones.append("(n.titulo LIKE :q OR n.subtitulo LIKE :q OR n.contenido LIKE :q)")
            params["q"] = f"%{escapar_like(q)}%"
        where = f" WHERE {' AND '.join(condiciones)} "

        total = Database.fetch_one(
            f"SELECT COUNT(*) AS total FROM noticias n INNER JOIN categorias c ON c.id = n.categoria_id{where}", params
        )["total"]
        paginacion = Paginacion(pagina=pagina, por_pagina=por_pagina, total=total)
        if pagina > paginacion.paginas:
            paginacion = Paginacion(pagina=paginacion.paginas, por_pagina=por_pagina, total=total)

        filas = Database.fetch_all(
            f"{cls._SELECT}{where}{cls._GROUP_BY}{cls._ORDEN_PUBLICO} LIMIT :limite OFFSET :offset",
            {**params, "limite": por_pagina, "offset": paginacion.offset},
        )
        return filas, paginacion

    @classmethod
    def publicada(cls, noticia_id: int) -> dict | None:
        return Database.fetch_one(
            f"{cls._SELECT} WHERE n.id = :id AND {cls._VISIBLE} {cls._GROUP_BY}", {"id": noticia_id}
        )

    @classmethod
    def destacadas(cls, limite: int) -> list[dict]:
        """Noticias marcadas como destacadas (hero y ticker). Si no hay ninguna,
        se usan las últimas publicadas para que el portal no quede vacío."""
        filas = Database.fetch_all(
            f"{cls._SELECT} WHERE {cls._VISIBLE} AND n.destacada = TRUE {cls._GROUP_BY}{cls._ORDEN_PUBLICO} LIMIT :limite",
            {"limite": limite},
        )
        if filas:
            return filas
        return Database.fetch_all(
            f"{cls._SELECT} WHERE {cls._VISIBLE} {cls._GROUP_BY}{cls._ORDEN_PUBLICO} LIMIT :limite", {"limite": limite}
        )

    @classmethod
    def ultimas_por_categoria(cls, por_categoria: int) -> list[dict]:
        """Las N noticias más recientes de cada categoría, en una sola consulta.
        ROW_NUMBER() numera las noticias dentro de cada categoría (1 = la más nueva)."""
        return Database.fetch_all(
            f"""
            {cls._SELECT}
            WHERE n.id IN (
                SELECT id FROM (
                    SELECT n2.id,
                           ROW_NUMBER() OVER (PARTITION BY n2.categoria_id
                                              ORDER BY n2.publicada_en DESC, n2.id DESC) AS posicion
                    FROM noticias n2
                    INNER JOIN categorias c2 ON c2.id = n2.categoria_id
                    WHERE n2.estado = 'publicada' AND n2.eliminado_en IS NULL AND c2.activo = TRUE
                ) AS numeradas
                WHERE posicion <= :n
            )
            {cls._GROUP_BY}
            ORDER BY c.orden, c.nombre, n.publicada_en DESC, n.id DESC
            """,
            {"n": por_categoria},
        )

    @classmethod
    def slug_unico(cls, titulo: str, excluir_id: int | None = None) -> str:
        base = slugify(titulo, max_largo=200) or "noticia"
        slug, n = base, 2
        while cls.exists("slug", slug, excluir_id):
            slug, n = f"{base}-{n}", n + 1
        return slug

    @classmethod
    def guardar(cls, datos: dict[str, Any], etiquetas: list[str], noticia_id: int | None = None) -> int:
        """Crea o actualiza la noticia y sus etiquetas en una sola transacción."""
        datos = dict(datos)
        with Database.transaction() as conn:
            actual = cls.find(noticia_id, conn) if noticia_id else None
            if datos.get("estado") == "publicada" and not (actual and actual["publicada_en"]):
                datos["publicada_en"] = datetime.now()

            if actual:
                cls.update(noticia_id, datos, conn)
            else:
                datos["slug"] = cls.slug_unico(datos["titulo"])
                noticia_id = cls.create(datos, conn)

            Etiqueta.sincronizar(noticia_id, etiquetas, conn)
        return noticia_id

    @classmethod
    def cambiar_estado(cls, noticia_id: int, estado: str, usuario_id: int) -> bool:
        if estado not in cls.ESTADOS:
            raise ValueError(estado)
        return Database.execute(
            """
            UPDATE noticias
            SET estado = :estado,
                actualizado_por = :usuario,
                publicada_en = CASE WHEN :estado = 'publicada' AND publicada_en IS NULL
                                    THEN NOW() ELSE publicada_en END
            WHERE id = :id AND eliminado_en IS NULL
            """,
            {"estado": estado, "usuario": usuario_id, "id": noticia_id},
        ).rowcount > 0

    @classmethod
    def eliminar(cls, noticia_id: int, usuario_id: int) -> bool:
        """Borrado lógico: la noticia deja de verse pero queda en la base (y en la auditoría)."""
        return Database.execute(
            """
            UPDATE noticias SET eliminado_en = NOW(), actualizado_por = :usuario
            WHERE id = :id AND eliminado_en IS NULL
            """,
            {"usuario": usuario_id, "id": noticia_id},
        ).rowcount > 0
