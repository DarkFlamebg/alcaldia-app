"""Validación del formulario de noticias.

El controlador recibe el formulario, se lo pasa a esta clase y solo guarda si
`valido()` devuelve True. Los errores se muestran junto a cada campo.
"""

from typing import Any

from starlette.datastructures import FormData, UploadFile

from app.models.categoria import Categoria
from app.models.etiqueta import Etiqueta
from app.models.noticia import Noticia

AUTOR_POR_DEFECTO = "Prensa Alcaldía"


class NoticiaForm:
    def __init__(self, form: FormData, es_nueva: bool) -> None:
        self.form = form
        self.es_nueva = es_nueva
        self.errores: dict[str, str] = {}
        self.datos: dict[str, Any] = {}
        self.etiquetas: list[str] = []
        self.imagen: UploadFile | None = None

    def _texto(self, campo: str) -> str:
        valor = self.form.get(campo, "")
        return valor.strip() if isinstance(valor, str) else ""

    def valores(self) -> dict[str, Any]:
        """Lo que escribió el usuario, para volver a llenar el formulario si hay errores."""
        return {
            "titulo": self._texto("titulo"),
            "subtitulo": self._texto("subtitulo"),
            "categoria_id": self._texto("categoria_id"),
            "contenido": self._texto("contenido"),
            "autor": self._texto("autor"),
            "etiquetas": self._texto("etiquetas"),
            "destacada": self.form.get("destacada") == "1",
            "estado": self._texto("estado") or "borrador",
        }

    def valido(self) -> bool:
        v = self.valores()

        if len(v["titulo"]) < 5:
            self.errores["titulo"] = "El título debe tener al menos 5 caracteres."
        elif len(v["titulo"]) > 200:
            self.errores["titulo"] = "El título no puede pasar de 200 caracteres."

        if len(v["subtitulo"]) > 300:
            self.errores["subtitulo"] = "El subtítulo no puede pasar de 300 caracteres."

        categoria_id = int(v["categoria_id"]) if v["categoria_id"].isdigit() else 0
        if not categoria_id or not Categoria.activa(categoria_id):
            self.errores["categoria_id"] = "Selecciona una categoría."

        if len(v["contenido"]) < 20:
            self.errores["contenido"] = "El contenido debe tener al menos 20 caracteres."

        autor = v["autor"] or AUTOR_POR_DEFECTO
        if len(autor) > 120:
            self.errores["autor"] = "El autor no puede pasar de 120 caracteres."

        if v["estado"] not in Noticia.ESTADOS:
            self.errores["estado"] = "Estado no válido."

        self.etiquetas = Etiqueta.parsear(v["etiquetas"])
        if len(self.etiquetas) > Etiqueta.MAX_POR_NOTICIA:
            self.errores["etiquetas"] = f"Máximo {Etiqueta.MAX_POR_NOTICIA} etiquetas por noticia."

        archivo = self.form.get("imagen")
        if isinstance(archivo, UploadFile) and archivo.filename:
            self.imagen = archivo
        elif self.es_nueva:
            self.errores["imagen"] = "La imagen es obligatoria."

        if self.errores:
            return False

        self.datos = {
            "titulo": v["titulo"],
            "subtitulo": v["subtitulo"] or None,
            "categoria_id": categoria_id,
            "contenido": v["contenido"],
            "autor": autor,
            "destacada": 1 if v["destacada"] else 0,
            "estado": v["estado"],
        }
        return True
