from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel

from app.core.exceptions import FormErrors, ValidationError
from app.core.images import ImageService
from app.core.security import Csrf, require_login, require_permiso, tiene_permiso
from app.forms.noticia_form import NoticiaForm
from app.models.auditoria import Auditoria
from app.models.noticia import Noticia
from app.views.noticia_view import NoticiaView


class EstadoRequest(BaseModel):
    estado: str


ACCION_POR_ESTADO = {"publicada": "publicar", "borrador": "despublicar", "archivada": "archivar"}


def _resumen(n: dict) -> dict:
    """Campos de la noticia que se guardan en la auditoría."""
    campos = ("titulo", "subtitulo", "categoria_id", "contenido", "imagen", "autor",
              "destacada", "estado", "etiquetas")
    datos = {c: n.get(c) for c in campos if c in n}
    if isinstance(datos.get("etiquetas"), str):  # en la consulta llegan como "A, B"
        datos["etiquetas"] = [e for e in datos["etiquetas"].split(", ") if e]
    return datos


class NoticiaController:
    """CRUD de noticias para el panel. Cada acción exige su permiso (noticias.*)."""

    POR_PAGINA = 15

    def __init__(self) -> None:
        self.router = APIRouter(
            prefix="/api/admin/noticias",
            tags=["admin: noticias"],
            dependencies=[Depends(require_login), Depends(Csrf.verificar)],
        )
        r = self.router
        ver = [Depends(require_permiso("noticias.ver"))]
        r.add_api_route("", self.index, methods=["GET"], dependencies=ver)
        r.add_api_route("", self.store, methods=["POST"], status_code=201,
                        dependencies=[Depends(require_permiso("noticias.crear"))])
        r.add_api_route("/{noticia_id}", self.show, methods=["GET"], dependencies=ver)
        r.add_api_route("/{noticia_id}", self.update, methods=["PUT"],
                        dependencies=[Depends(require_permiso("noticias.editar"))])
        r.add_api_route("/{noticia_id}/estado", self.cambiar_estado, methods=["PATCH"],
                        dependencies=[Depends(require_permiso("noticias.publicar"))])
        r.add_api_route("/{noticia_id}", self.destroy, methods=["DELETE"], status_code=204,
                        dependencies=[Depends(require_permiso("noticias.eliminar"))])

    async def index(
        self,
        q: str = Query("", max_length=100),
        categoria: int | None = Query(None, ge=1),
        estado: str | None = None,
        pagina: int = Query(1, ge=1),
    ) -> dict:
        filas, paginacion = Noticia.listar(q.strip(), categoria, estado, pagina, self.POR_PAGINA)
        return NoticiaView.lista(filas, paginacion)

    async def show(self, noticia_id: int) -> dict:
        return {"data": NoticiaView.item(self._buscar(noticia_id))}

    async def store(self, request: Request, usuario: dict = Depends(require_login)) -> dict:
        nf = NoticiaForm(await request.form(), es_nueva=True)
        if not nf.valido():
            raise FormErrors(nf.errores)
        self._verificar_estado(usuario, nf.datos["estado"], "borrador")

        archivo = await self._guardar_imagen(nf)
        datos = {**nf.datos, "imagen": archivo, "creado_por": usuario["id"]}
        try:
            noticia_id = Noticia.guardar(datos, nf.etiquetas)
        except Exception:
            ImageService.eliminar(archivo)
            raise
        Auditoria.registrar(request, "crear", "noticias", noticia_id,
                            nuevos=_resumen({**datos, "etiquetas": nf.etiquetas}))
        return {"data": NoticiaView.item(self._buscar(noticia_id))}

    async def update(self, request: Request, noticia_id: int, usuario: dict = Depends(require_login)) -> dict:
        actual = self._buscar(noticia_id)
        nf = NoticiaForm(await request.form(), es_nueva=False)
        if not nf.valido():
            raise FormErrors(nf.errores)
        self._verificar_estado(usuario, nf.datos["estado"], actual["estado"])

        datos = {**nf.datos, "actualizado_por": usuario["id"]}
        nueva_imagen = await self._guardar_imagen(nf) if nf.imagen else None
        if nueva_imagen:
            datos["imagen"] = nueva_imagen
        try:
            Noticia.guardar(datos, nf.etiquetas, noticia_id)
        except Exception:
            ImageService.eliminar(nueva_imagen)
            raise

        if nueva_imagen:
            ImageService.eliminar(actual["imagen"])  # la anterior ya no se usa
        Auditoria.registrar(request, "editar", "noticias", noticia_id,
                            anteriores=_resumen(actual),
                            nuevos=_resumen({**datos, "etiquetas": nf.etiquetas}))
        return {"data": NoticiaView.item(self._buscar(noticia_id))}

    async def cambiar_estado(self, request: Request, noticia_id: int, datos: EstadoRequest,
                             usuario: dict = Depends(require_login)) -> dict:
        actual = self._buscar(noticia_id)
        if datos.estado not in Noticia.ESTADOS:
            raise FormErrors({"estado": "Estado no válido."})
        Noticia.cambiar_estado(noticia_id, datos.estado, usuario["id"])
        if datos.estado != actual["estado"]:
            Auditoria.registrar(request, ACCION_POR_ESTADO[datos.estado], "noticias", noticia_id,
                                anteriores={"estado": actual["estado"]}, nuevos={"estado": datos.estado})
        return {"data": NoticiaView.item(self._buscar(noticia_id))}

    async def destroy(self, request: Request, noticia_id: int, usuario: dict = Depends(require_login)) -> Response:
        actual = self._buscar(noticia_id)
        # Borrado lógico: se conserva la fila y la imagen por si hay que recuperarla.
        Noticia.eliminar(noticia_id, usuario["id"])
        Auditoria.registrar(request, "eliminar", "noticias", noticia_id, anteriores=_resumen(actual))
        return Response(status_code=204)

    @staticmethod
    def _verificar_estado(usuario: dict, nuevo: str, actual: str) -> None:
        """Sin el permiso noticias.publicar no se puede cambiar el estado de una noticia."""
        if nuevo != actual and not tiene_permiso(usuario, "noticias.publicar"):
            raise FormErrors({"estado": "No tienes permiso para publicar. Guárdala como borrador para que un editor la revise."})

    @staticmethod
    def _buscar(noticia_id: int) -> dict:
        noticia = Noticia.detalle(noticia_id)
        if noticia is None:
            raise HTTPException(status_code=404, detail="La noticia no existe.")
        return noticia

    @staticmethod
    async def _guardar_imagen(nf: NoticiaForm) -> str:
        try:
            return await ImageService.guardar(nf.imagen)
        except ValidationError as exc:
            raise FormErrors({"imagen": str(exc)}) from exc
