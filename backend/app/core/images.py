"""Validación y guardado de imágenes subidas desde el panel.

La imagen se abre con Pillow para comprobar que realmente es una imagen
(no basta con la extensión) y se vuelve a guardar desde cero. Así se descarta
cualquier contenido oculto en el archivo original y se eliminan sus metadatos.
"""

import uuid
from io import BytesIO

from PIL import Image, ImageOps, UnidentifiedImageError
from starlette.datastructures import UploadFile

from app.config import config
from app.core.exceptions import ValidationError

MAX_PIXELES = 40_000_000
Image.MAX_IMAGE_PIXELS = MAX_PIXELES


class ImageService:
    FORMATOS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
    LADO_MAXIMO = 1920

    @classmethod
    async def guardar(cls, archivo: UploadFile) -> str:
        """Valida la imagen, la guarda con un nombre aleatorio y devuelve ese nombre."""
        max_bytes = config.MAX_IMAGE_MB * 1024 * 1024
        datos = await archivo.read(max_bytes + 1)
        if not datos:
            raise ValidationError("El archivo está vacío.")
        if len(datos) > max_bytes:
            raise ValidationError(f"La imagen supera el máximo de {config.MAX_IMAGE_MB} MB.")

        try:
            with Image.open(BytesIO(datos)) as img:
                img.verify()  # detecta archivos dañados o que no son imágenes
            with Image.open(BytesIO(datos)) as original:
                formato = original.format
                if formato not in cls.FORMATOS:
                    raise ValidationError("Formato no permitido. Usa JPG, PNG o WEBP.")
                if original.width * original.height > MAX_PIXELES:
                    raise ValidationError("La imagen tiene demasiados píxeles.")

                img = ImageOps.exif_transpose(original)  # respeta la orientación de la cámara
                img.thumbnail((cls.LADO_MAXIMO, cls.LADO_MAXIMO))
                if formato == "JPEG" and img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")

                nombre = f"{uuid.uuid4().hex}{cls.FORMATOS[formato]}"
                config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
                img.save(config.UPLOAD_DIR / nombre, format=formato, quality=85, optimize=True)
        except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError) as exc:
            raise ValidationError("El archivo no es una imagen válida.") from exc

        return nombre

    @staticmethod
    def eliminar(nombre: str | None) -> None:
        if not nombre:
            return
        carpeta = config.UPLOAD_DIR.resolve()
        ruta = (carpeta / nombre).resolve()
        if ruta.parent != carpeta:  # nunca borrar fuera de la carpeta de subidas
            return
        ruta.unlink(missing_ok=True)

    @staticmethod
    def url(nombre: str | None) -> str | None:
        return f"{config.UPLOAD_URL}/{nombre}" if nombre else None
