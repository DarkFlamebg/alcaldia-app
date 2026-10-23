"""Vistas JSON (la "V" de MVC en el backend).

Convierten las filas de la BD en el JSON que recibe React. Así el formato de
la respuesta está en un solo lugar y los controladores no arman diccionarios
a mano. Nunca incluyen datos sensibles como el hash de la contraseña.
"""

from datetime import datetime

from app.core.images import ImageService
from app.core.pagination import Paginacion


def _iso(valor: datetime | None) -> str | None:
    return valor.isoformat() if valor else None


class NoticiaView:
    @staticmethod
    def item(n: dict) -> dict:
        return {
            "id": n["id"],
            "titulo": n["titulo"],
            "subtitulo": n["subtitulo"],
            "slug": n["slug"],
            "contenido": n["contenido"],
            "imagen": n["imagen"],
            "imagen_url": ImageService.url(n["imagen"]),
            "autor": n["autor"],
            "destacada": bool(n["destacada"]),
            "estado": n["estado"],
            "categoria": {"id": n["categoria_id"], "nombre": n["categoria_nombre"], "slug": n["categoria_slug"]},
            "etiquetas": [e for e in (n["etiquetas"] or "").split(", ") if e],
            "creado_por": {"id": n["creado_por"], "nombre": n["creado_por_nombre"]},
            "actualizado_por": (
                {"id": n["actualizado_por"], "nombre": n["actualizado_por_nombre"]} if n["actualizado_por"] else None
            ),
            "publicada_en": _iso(n["publicada_en"]),
            "creado_en": _iso(n["creado_en"]),
            "actualizado_en": _iso(n["actualizado_en"]),
        }

    @classmethod
    def lista(cls, filas: list[dict], paginacion: Paginacion) -> dict:
        return {
            "data": [cls.item(n) for n in filas],
            "meta": {
                "pagina": paginacion.pagina,
                "por_pagina": paginacion.por_pagina,
                "total": paginacion.total,
                "paginas": paginacion.paginas,
            },
        }


class CategoriaView:
    @staticmethod
    def item(c: dict) -> dict:
        datos = {"id": c["id"], "nombre": c["nombre"], "slug": c["slug"]}
        if "total_noticias" in c:
            datos["total_noticias"] = int(c["total_noticias"])
            datos["publicadas"] = int(c["publicadas"])
        return datos


class EtiquetaView:
    @staticmethod
    def item(e: dict) -> dict:
        return {"id": e["id"], "nombre": e["nombre"], "slug": e["slug"], "usos": int(e.get("usos", 0))}


class NoticiaPublicaView:
    """Noticia para el portal público. No incluye datos internos
    (estado, quién la creó o editó, fechas de creación)."""

    LARGO_EXTRACTO = 180

    @classmethod
    def extracto(cls, n: dict) -> str:
        if n["subtitulo"]:
            return n["subtitulo"]
        texto = " ".join((n["contenido"] or "").split())
        if len(texto) <= cls.LARGO_EXTRACTO:
            return texto
        return texto[: cls.LARGO_EXTRACTO].rsplit(" ", 1)[0] + "…"

    @classmethod
    def item(cls, n: dict, completo: bool = False) -> dict:
        datos = {
            "id": n["id"],
            "titulo": n["titulo"],
            "subtitulo": n["subtitulo"],
            "slug": n["slug"],
            "extracto": cls.extracto(n),
            "imagen_url": ImageService.url(n["imagen"]),
            "autor": n["autor"],
            "destacada": bool(n["destacada"]),
            "categoria": {"nombre": n["categoria_nombre"], "slug": n["categoria_slug"]},
            "etiquetas": [e for e in (n["etiquetas"] or "").split(", ") if e],
            "publicada_en": _iso(n["publicada_en"]),
        }
        if completo:
            datos["contenido"] = n["contenido"]
        return datos

    @classmethod
    def lista(cls, filas: list[dict], paginacion: Paginacion) -> dict:
        return {
            "data": [cls.item(n) for n in filas],
            "meta": {
                "pagina": paginacion.pagina,
                "por_pagina": paginacion.por_pagina,
                "total": paginacion.total,
                "paginas": paginacion.paginas,
            },
        }
