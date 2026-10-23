class ValidationError(Exception):
    """Dato inválido enviado por el usuario (por ejemplo, una imagen que no es imagen)."""


class FormErrors(Exception):
    """Errores de un formulario, campo por campo. La API responde 422 con
    {"detail": "...", "errores": {"campo": "mensaje"}}."""

    def __init__(self, errores: dict[str, str], detail: str = "Revisa los campos marcados.") -> None:
        super().__init__(detail)
        self.errores = errores
        self.detail = detail
