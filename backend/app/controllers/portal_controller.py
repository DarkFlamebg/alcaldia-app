from fastapi import APIRouter, HTTPException, Query

from app.models.noticia import Noticia
from app.views.noticia_view import NoticiaPublicaView


class PortalController:
    """API pública del portal (solo lectura, sin sesión).

    Solo devuelve noticias publicadas, no eliminadas y de categorías activas.
    Todas las respuestas /api llevan `Cache-Control: no-store` (ver main.py),
    así un cambio hecho en el panel se ve al recargar la página.
    """

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/api/portal", tags=["portal público"])
        r = self.router
        r.add_api_route("/inicio", self.inicio, methods=["GET"])
        r.add_api_route("/destacadas", self.destacadas, methods=["GET"])
        r.add_api_route("/noticias", self.noticias, methods=["GET"])
        r.add_api_route("/noticias/{noticia_id}", self.noticia, methods=["GET"])

    async def inicio(self, por_categoria: int = Query(2, ge=1, le=6)) -> dict:
        """Portada: las últimas noticias de cada categoría, agrupadas."""
        bloques: dict[str, dict] = {}
        for n in Noticia.ultimas_por_categoria(por_categoria):
            bloque = bloques.setdefault(n["categoria_slug"], {
                "nombre": n["categoria_nombre"], "slug": n["categoria_slug"], "noticias": [],
            })
            bloque["noticias"].append(NoticiaPublicaView.item(n))
        return {"data": list(bloques.values())}

    async def destacadas(self, limite: int = Query(5, ge=1, le=15)) -> dict:
        """Noticias destacadas, para el carrusel y el ticker de titulares."""
        return {"data": [NoticiaPublicaView.item(n) for n in Noticia.destacadas(limite)]}

    async def noticias(
        self,
        categoria: str | None = Query(None, max_length=80, pattern=r"^[a-z0-9-]+$"),
        etiqueta: str | None = Query(None, max_length=60, pattern=r"^[a-z0-9-]+$"),
        q: str = Query("", max_length=100),
        pagina: int = Query(1, ge=1),
        por_pagina: int = Query(10, ge=1, le=24),
    ) -> dict:
        filas, paginacion = Noticia.publicadas(categoria, etiqueta, q.strip(), pagina, por_pagina)
        return NoticiaPublicaView.lista(filas, paginacion)

    async def noticia(self, noticia_id: int) -> dict:
        n = Noticia.publicada(noticia_id)
        if n is None:
            raise HTTPException(status_code=404, detail="La noticia no existe o ya no está publicada.")
        return {"data": NoticiaPublicaView.item(n, completo=True)}
