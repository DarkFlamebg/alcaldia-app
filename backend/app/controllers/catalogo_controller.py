from fastapi import APIRouter, Depends, Query

from app.core.security import require_login
from app.models.categoria import Categoria
from app.models.etiqueta import Etiqueta
from app.views.noticia_view import CategoriaView, EtiquetaView


class CatalogoController:
    """Listas que necesita el formulario de noticias: categorías y etiquetas."""

    def __init__(self) -> None:
        self.router = APIRouter(prefix="/api/admin", tags=["admin: catálogos"], dependencies=[Depends(require_login)])
        self.router.add_api_route("/categorias", self.categorias, methods=["GET"])
        self.router.add_api_route("/etiquetas", self.etiquetas, methods=["GET"])

    async def categorias(self) -> dict:
        return {"data": [CategoriaView.item(c) for c in Categoria.con_conteo()]}

    async def etiquetas(self, limite: int = Query(20, ge=1, le=100)) -> dict:
        return {"data": [EtiquetaView.item(e) for e in Etiqueta.mas_usadas(limite)]}
