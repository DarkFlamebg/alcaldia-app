"""Configuración de la aplicación, leída desde el archivo .env."""

import os
import secrets
import warnings
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import URL

BASE_DIR = Path(__file__).resolve().parent.parent  # carpeta backend/
APP_DIR = BASE_DIR / "app"

load_dotenv(BASE_DIR / ".env")


def _bool(nombre: str, defecto: bool = False) -> bool:
    return os.getenv(nombre, str(defecto)).strip().lower() in ("1", "true", "si", "sí", "yes")


class Config:
    APP_NAME = os.getenv("APP_NAME", "Alcaldía del Municipio Rafael Rangel")
    DEBUG = _bool("APP_DEBUG")

    SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
    SESSION_COOKIE = "alcaldia_session"
    SESSION_MAX_AGE = 60 * 60 * 8  # 8 horas
    SESSION_HTTPS_ONLY = _bool("SESSION_HTTPS_ONLY")

    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "alcaldia_db")

    # Orígenes del frontend que pueden llamar a la API desde otro dominio/puerto.
    # En desarrollo no hace falta: Vite reenvía /api al backend (mismo origen).
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

    STATIC_DIR = APP_DIR / "static"
    UPLOAD_DIR = STATIC_DIR / "uploads" / "noticias"
    UPLOAD_URL = "/static/uploads/noticias"
    MAX_IMAGE_MB = int(os.getenv("MAX_IMAGE_MB", "5"))
    # Límite total de una petición (imagen + campos del formulario)
    MAX_REQUEST_BYTES = (MAX_IMAGE_MB + 2) * 1024 * 1024

    def __init__(self) -> None:
        if not self.SECRET_KEY:
            if not self.DEBUG:
                raise RuntimeError("Falta SECRET_KEY en el archivo .env")
            warnings.warn("SECRET_KEY vacía: se usa una temporal y las sesiones se cierran al reiniciar.")
            self.SECRET_KEY = secrets.token_urlsafe(48)

    def database_url(self, con_base: bool = True) -> URL:
        return URL.create(
            "mysql+pymysql",
            username=self.DB_USER,
            password=self.DB_PASSWORD or None,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME if con_base else None,
            query={"charset": "utf8mb4"},
        )


config = Config()
