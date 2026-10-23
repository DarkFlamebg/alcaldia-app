# Instalación y uso en local

Necesitas Python 3.11, Node.js y MySQL 8 corriendo.

## 1. Backend

```powershell
cd backend
py -3.11 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

En `.env`:
- `DB_USER` y `DB_PASSWORD`: tu usuario de MySQL.
- `SECRET_KEY`: genera una con `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

Crea la base de datos. Hay dos formas:

- **Consola:** `python -m scripts.init_db` (también copia las imágenes de ejemplo).
- **MySQL Workbench:** ejecuta `backend/database/schema.sql` y luego `seed.sql`.
  Después copia las imágenes de `backend/database/semillas/img/` a
  `backend/app/static/uploads/noticias/`.

Crea tu usuario (rol `administrador` por defecto):

```powershell
python -m scripts.crear_admin
```

Arranca la API:

```powershell
uvicorn main:app --reload
```

Comprueba que responde en `http://127.0.0.1:8000/api`.

## 2. Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

- Portal: `http://localhost:5173`
- Panel: `http://localhost:5173/admin` (o el menú ⋮ → "Soy Administrador")

## Comandos útiles

| Comando (en `backend/`) | Qué hace |
| --- | --- |
| `python -m scripts.init_db` | Crea tablas y datos que falten (no borra nada) |
| `python -m scripts.init_db --reset` | Borra la base completa y la vuelve a crear |
| `python -m scripts.init_db --sin-datos` | Solo tablas, sin noticias de ejemplo |
| `python -m scripts.crear_admin --rol editor` | Crea un editor o un periodista (o cambia la contraseña si el correo ya existe) |

## Producción (pendiente, Fase 4)

- `APP_DEBUG=false`, `SESSION_HTTPS_ONLY=true` y una `SECRET_KEY` propia.
- Servir el build de React y la API bajo el mismo dominio (por ejemplo, con
  Nginx reenviando `/api` y `/static` a Uvicorn). Si van en dominios distintos,
  completar `CORS_ORIGINS`.
