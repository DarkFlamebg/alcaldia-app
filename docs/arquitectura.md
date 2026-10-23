# Arquitectura

```text
alcaldia-app/
├── docs/        ← esta documentación
├── frontend/    ← React (portal público + panel /admin)
└── backend/     ← API JSON en Python (solo backend)
```

En desarrollo corren dos servidores:

| Servidor | Puerto | Qué hace |
| --- | --- | --- |
| Vite (`npm run dev`) | 5173 | Sirve React. Reenvía `/api` y `/static` al backend. |
| Uvicorn (`uvicorn main:app`) | 8000 | API JSON e imágenes subidas. |

Como Vite reenvía las peticiones, el navegador ve un solo origen
(`localhost:5173`) y la cookie de sesión funciona sin configurar CORS.

## Backend: MVC con POO

```text
backend/
├── main.py                  crea la app, middlewares y registra controladores
├── requirements.txt
├── .env                     credenciales (no se sube a git)
├── database/
│   ├── schema.sql           tablas y vista
│   ├── seed.sql             datos iniciales
│   └── semillas/img/        imágenes de las noticias iniciales
├── scripts/
│   ├── init_db.py           crea la BD y carga los datos
│   └── crear_admin.py       crea usuarios del panel
└── app/
    ├── config.py            lee el .env
    ├── core/                piezas compartidas
    │   ├── database.py      Database: consultas parametrizadas y transacciones
    │   ├── model.py         Model: clase base (find, create, update, delete, exists)
    │   ├── security.py      PasswordHasher, Csrf, Auth, require_login, require_permiso
    │   ├── images.py        ImageService: valida y guarda imágenes con Pillow
    │   ├── pagination.py    Paginacion
    │   ├── text.py          slugify y utilidades de texto
    │   └── exceptions.py    ValidationError, FormErrors
    ├── models/          (M) Usuario, Categoria, Noticia, Etiqueta
    ├── forms/               NoticiaForm: valida lo que envía el panel
    ├── views/           (V) NoticiaView, CategoriaView, EtiquetaView, UsuarioView → JSON
    ├── controllers/     (C) AuthController, NoticiaController, CatalogoController
    └── static/uploads/noticias/   imágenes subidas
```

**Cómo fluye una petición** (por ejemplo, editar una noticia):

1. React envía `PUT /api/admin/noticias/5` con el formulario y el header `X-CSRF-Token`.
2. `NoticiaController.update` verifica la sesión y el token CSRF (dependencias de FastAPI).
3. `NoticiaForm` valida los campos. Si algo falla, responde 422 con los errores por campo.
4. `ImageService` valida y guarda la imagen nueva, si se envió una.
5. `Noticia.guardar` actualiza la noticia y sus etiquetas en una transacción.
6. `NoticiaView.item` convierte el resultado a JSON y el controlador lo devuelve.

**Reglas:**
- Los controladores no escriben SQL: llaman a los modelos.
- Los modelos no saben nada de HTTP.
- Las vistas deciden qué campos salen en el JSON (nunca el hash de la contraseña).

## Frontend: portal público

```text
frontend/src/
├── portal/
│   ├── api.js               cliente de /api/portal (solo lectura)
│   ├── useDatos.js          hook: carga datos y los refresca al volver a la pestaña
│   ├── formato.js           fechas y párrafos
│   └── ListadoCategoria.jsx lista paginada de una categoría (la usan las 6 páginas)
└── components/
    ├── Inicio.jsx, Hero.jsx, Titulares.jsx, NewsCard.jsx, News.jsx   → datos de la API
    └── Cultura.jsx … Deportes.jsx   → solo definen su barra lateral
```

## Frontend: panel del administrador

```text
frontend/src/
├── App.jsx                rutas: portal (PortalLayout) y /admin (AdminRoot)
└── admin/
    ├── api.js             cliente de la API (cookie + CSRF + errores)
    ├── auth.js            contexto y hook useAuth
    ├── AuthProvider.jsx   consulta la sesión y expone login/logout
    ├── RequireAuth.jsx    protege las rutas del panel
    ├── AdminLayout.jsx    barra superior del panel
    ├── estilos.js         clases de Tailwind compartidas
    ├── ui.jsx             componentes Campo y Aviso
    └── pages/
        ├── Login.jsx
        ├── NoticiasList.jsx
        └── NoticiaForm.jsx
```

Rutas: `/admin/login`, `/admin/noticias`, `/admin/noticias/nueva`,
`/admin/noticias/:id/editar`.

## Login y seguridad

1. React pide un token a `GET /api/auth/csrf`.
2. Envía email y contraseña a `POST /api/auth/login` con ese token en `X-CSRF-Token`.
3. El backend compara la contraseña con bcrypt. Si es correcta, reinicia la
   sesión (para evitar que alguien fije una sesión de antemano) y guarda el
   id del usuario en una cookie firmada y HttpOnly. JavaScript no puede leer
   esa cookie.
4. Cada `POST/PUT/PATCH/DELETE` debe llevar el token CSRF. Un sitio externo no
   puede leerlo, así que no puede hacer cambios en nombre del administrador.
5. Tras 5 contraseñas incorrectas la cuenta se bloquea 15 minutos (guardado en
   la base: `usuarios.bloqueado_hasta` y `registro_accesos`).
6. Cada ruta del panel exige un permiso del rol (`require_permiso("noticias.eliminar")`).
   React usa `puede(usuario, codigo)` solo para ocultar botones; quien decide es el backend.

Imágenes: se comprueba con Pillow que sean JPG, PNG o WEBP de verdad, se
limitan a 5 MB, se reducen a 1920 px como máximo y se vuelven a guardar con
un nombre aleatorio. Así se descarta cualquier contenido oculto y los metadatos.
