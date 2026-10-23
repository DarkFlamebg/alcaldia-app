import re
import unicodedata


def slugify(texto: str, max_largo: int = 200) -> str:
    """'Inauguración de la Galería' -> 'inauguracion-de-la-galeria'."""
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = re.sub(r"[^a-zA-Z0-9]+", "-", texto).strip("-").lower()
    return texto[:max_largo].rstrip("-")


def escapar_like(texto: str) -> str:
    """Escapa los comodines de LIKE para buscar el texto literal."""
    return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def limpiar_espacios(texto: str) -> str:
    return re.sub(r"\s+", " ", texto).strip()
