# Registro de cambios

## 2026-10-23 · Fase 2 · Portal conectado a la base de datos

**Backend**
- Nuevo `PortalController` (`/api/portal/inicio`, `/destacadas`, `/noticias`,
  `/noticias/{id}`): solo noticias publicadas, no eliminadas y de categorías activas.
- `Noticia`: consultas `publicadas`, `publicada`, `destacadas` y
  `ultimas_por_categoria` (usa `ROW_NUMBER()` por categoría).
- `NoticiaPublicaView`: JSON público sin datos internos, con `extracto`.
- Todas las respuestas `/api` llevan `Cache-Control: no-store`.

**Frontend**
- `Inicio`, `Hero`, `Titulares`, `News` y las 6 páginas de categoría leen de la API.
  Se quitaron los datos escritos a mano.
- Nuevo `src/portal/` (cliente, hook `useDatos`, formato, `ListadoCategoria`).
- El portal vuelve a pedir los datos al regresar a la pestaña.
- Mensajes cuando no hay noticias, cuando una noticia no existe o ya no está
  publicada, y cuando falla la conexión.

## 2026-10-23 · Prueba integral con MySQL

- Base creada en Workbench y datos cargados con `seed.sql`.
- 60 pruebas de punta a punta contra la API y la base real, todas OK: CSRF,
  login y bloqueo por intentos, registro de accesos, listados con JOINs,
  búsqueda, crear/editar/publicar/archivar/eliminar, imágenes, slugs,
  etiquetas, auditoría y permisos de los tres roles.
- El proxy de Vite (`/api`, `/static`) funciona con el panel en `/admin`.

## 2026-10-23 · Imágenes múltiples por noticia (solo base de datos)

- Nueva tabla `noticia_imagenes`: hasta 5 imágenes adicionales por noticia,
  con pie de foto y orden. Con la portada (`noticias.imagen`) suman máximo 6.
- `docs/base-de-datos.md` reescrito como guía completa: función de cada tabla,
  orden de creación, relaciones, ordenamiento de listados, reglas para
  cualquier backend y consultas de referencia.
- Pendiente: implementar las imágenes adicionales en el backend y el panel.

## 2026-10-23 · Fase 1 · Nuevo diseño de base de datos

**Base de datos**
- Se adopta el diseño del equipo (`db/Create DB Alcaldiadb.sql`) y se corrige
  en `backend/database/schema.sql`: 17 tablas (roles, permisos, auditoría,
  registro de accesos, configuración, menú, noticias, eventos, institucional,
  galería) y la vista `v_noticias_publicadas`.
- Correcciones: FK errónea `categorias.orden`, `ON UPDATE CURRENT_TIMESTAMP`,
  `datetime`, `utf8mb4`, nombres únicos, reglas al borrar, `IF NOT EXISTS`.
- `seed.sql`: roles, 24 permisos, usuario `Sistema`, configuración y menú
  actuales del sitio, 6 categorías, 9 etiquetas y 12 noticias.
- Los dos archivos se pueden ejecutar directo en MySQL Workbench.

**Backend**
- Login con roles y permisos desde la base (`require_permiso`). El usuario
  devuelve su lista de `permisos`.
- Bloqueo por intentos fallidos guardado en la base (5 intentos → 15 min) y
  registro de cada intento en `registro_accesos`. Se quitó `LoginThrottle`.
- Auditoría de login, logout, crear, editar, publicar, archivar y eliminar.
- Noticias: `creado_por` / `actualizado_por`, estado `archivada`, borrado lógico.
- Nuevos modelos: `Rol`, `RegistroAcceso`, `Auditoria`.
- `crear_admin --rol` acepta administrador, editor o periodista.

**Frontend**
- Botones según permisos (`puede(usuario, 'noticias.eliminar')`).
- Estado "Archivada" en el filtro y el formulario. Sin permiso para publicar,
  el estado queda bloqueado.

## 2026-10-23 · Fase 1

**Backend (nuevo, en `backend/`)**
- Estructura MVC: `app/core`, `app/models`, `app/views`, `app/controllers`, `app/forms`.
- Base de datos: `schema.sql` (5 tablas y 1 vista) y `seed.sql` (6 categorías,
  9 etiquetas, las 12 noticias de `Inicio.jsx`).
- Scripts `init_db` y `crear_admin`.
- API: autenticación (`/api/auth/*`), CRUD de noticias y catálogos (`/api/admin/*`).
- Seguridad: bcrypt, sesión HttpOnly firmada, CSRF, límite de intentos de
  login, validación de imágenes con Pillow, límite de 7 MB por petición y
  encabezados de seguridad.

**Frontend**
- Nuevo panel en `src/admin/`: login, listado de noticias y formulario.
- `App.jsx`: rutas separadas entre el portal (`PortalLayout`) y el panel (`/admin`).
- `Header.jsx`: "Soy Administrador" ahora lleva a `/admin` (antes mostraba un aviso de "Próximamente").
- `vite.config.js`: reenvía `/api` y `/static` al backend.

**Documentación**
- Nueva carpeta `docs/`.
