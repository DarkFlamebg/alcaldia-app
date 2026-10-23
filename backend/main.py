"""Punto de entrada del backend (API JSON).

Desarrollo, desde la carpeta backend/:
    uvicorn main:app --reload
Documentación interactiva de la API (solo con APP_DEBUG=true): http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from app.config import config
from app.controllers.auth_controller import AuthController
from app.controllers.catalogo_controller import CatalogoController
from app.controllers.noticia_controller import NoticiaController
from app.controllers.portal_controller import PortalController
from app.core.exceptions import FormErrors

CSP_API = "default-src 'none'; frame-ancestors 'none'"


def create_app() -> FastAPI:
    app = FastAPI(
        title=config.APP_NAME,
        docs_url="/docs" if config.DEBUG else None,
        redoc_url=None,
        openapi_url="/openapi.json" if config.DEBUG else None,
    )

    @app.middleware("http")
    async def seguridad(request: Request, call_next) -> Response:
        largo = request.headers.get("content-length")
        if largo and largo.isdigit() and int(largo) > config.MAX_REQUEST_BYTES:
            return JSONResponse({"detail": "La petición es demasiado grande."}, status_code=413)
        respuesta = await call_next(request)
        respuesta.headers.setdefault("X-Content-Type-Options", "nosniff")
        respuesta.headers.setdefault("X-Frame-Options", "DENY")
        respuesta.headers.setdefault("Referrer-Policy", "same-origin")
        if not request.url.path.startswith(("/docs", "/openapi.json")):
            respuesta.headers.setdefault("Content-Security-Policy", CSP_API)
        if request.url.path.startswith("/api"):
            # Los datos cambian desde el panel: el navegador nunca debe guardar
            # una copia vieja (por ejemplo, una noticia ya despublicada).
            respuesta.headers.setdefault("Cache-Control", "no-store")
        return respuesta

    # Los middlewares añadidos después envuelven a los anteriores:
    # la sesión debe existir antes de que corra el código de las rutas.
    app.add_middleware(
        SessionMiddleware,
        secret_key=config.SECRET_KEY,
        session_cookie=config.SESSION_COOKIE,
        max_age=config.SESSION_MAX_AGE,
        same_site="lax",
        https_only=config.SESSION_HTTPS_ONLY,
    )
    if config.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=config.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
            allow_headers=["Content-Type", "X-CSRF-Token"],
        )

    # Imágenes subidas desde el panel
    app.mount("/static", StaticFiles(directory=config.STATIC_DIR), name="static")

    app.include_router(AuthController().router)
    app.include_router(NoticiaController().router)
    app.include_router(CatalogoController().router)
    app.include_router(PortalController().router)

    @app.get("/api", include_in_schema=False)
    async def estado() -> dict:
        return {"app": config.APP_NAME, "estado": "ok"}

    @app.exception_handler(FormErrors)
    async def errores_formulario(_request: Request, exc: FormErrors) -> JSONResponse:
        return JSONResponse({"detail": exc.detail, "errores": exc.errores}, status_code=422)

    return app


app = create_app()
