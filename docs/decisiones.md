# Decisiones

Cada decisión con su motivo, para no tener que volver a discutirla.

| Fecha | Decisión | Motivo |
| --- | --- | --- |
| 2026-10-23 | Python con FastAPI, SQLAlchemy y MySQL | El docente permite Python o PHP. FastAPI es moderno y simple para una API JSON. |
| 2026-10-23 | El backend es **solo una API JSON**. El panel del admin se hace en React. | Decisión del equipo: `backend/` lleva solo backend y todo lo visual va en React. Se descartaron las plantillas Jinja2 del plan inicial. |
| 2026-10-23 | La "V" de MVC en el backend son clases que arman el JSON (`app/views`) | Así cada capa sigue separada aunque no haya HTML en el backend. |
| 2026-10-23 | SQL escrito a mano con `text()` y parámetros, en lugar del ORM | Los JOINs quedan visibles para la evaluación y el código se parece a PDO. |
| 2026-10-23 | Etiquetas en tablas propias (`etiquetas` + `noticia_etiqueta`) desde la Fase 1 | Da JOINs reales y evita migrar después. Reemplaza la columna de texto con comas del plan inicial. |
| 2026-10-23 | Sesión en cookie firmada HttpOnly + token CSRF en header, en lugar de JWT | Más simple y seguro para un panel en el mismo dominio. JavaScript no puede leer la cookie. |
| 2026-10-23 | Vite reenvía `/api` y `/static` al backend en desarrollo | Mismo origen, la cookie funciona sin configurar CORS. |
| 2026-10-23 | Las imágenes de las noticias de ejemplo se copian en `backend/database/semillas/img` | El backend no depende de archivos de `frontend/`. |
| 2026-10-23 | El contenido de la noticia es texto plano, con párrafos separados por línea en blanco | Evita que un texto guardado ejecute código en el navegador. Si hace falta formato (negritas, enlaces), se evaluará un editor con limpieza de HTML. |
| 2026-10-23 | El `slug` se genera al crear la noticia y no cambia al editar el título | Los enlaces a la noticia no se rompen. |
| 2026-10-23 | ~~Eliminar noticias: solo `admin`~~ → reemplazada por roles y permisos en tablas (ver abajo) | — |
| 2026-10-23 | Se adopta el diseño de BD del equipo (`db/Create DB Alcaldiadb.sql`) como base oficial, corregido, en `backend/database/schema.sql` | Es más completo: roles y permisos, auditoría, registro de accesos, borrado lógico y las tablas de todos los módulos. |
| 2026-10-23 | Correcciones al diseño: se quitó la FK `categorias.orden → categorias.id`; `ON UPDATE CURRENT_TIMESTAMP`; `datetime` en lugar de `timestamp`; `utf8mb4`; `categorias.nombre` único; reglas `CASCADE`/`SET NULL`; `IF NOT EXISTS` | La FK impedía crear categorías; `timestamp` termina en 2038; el resto evita errores y permite ejecutar el script varias veces. |
| 2026-10-23 | Permisos: administrador todo; editor todo el contenido menos eliminar; periodista crea y edita sin publicar | Evita borrados accidentales y permite revisión antes de publicar. |
| 2026-10-23 | Usuario interno `Sistema` (inactivo) como autor de los datos de ejemplo | `noticias.creado_por` es obligatorio y las noticias de ejemplo necesitan un autor. |
| 2026-10-23 | El límite de intentos de login se guarda en la base (ya no en memoria) | No se pierde al reiniciar el servidor y queda registro en `registro_accesos`. |
| 2026-10-23 | Eliminar una noticia es borrado lógico y conserva su imagen | Se puede recuperar y la auditoría conserva los datos. |
| 2026-10-23 | Imágenes de noticia: portada en `noticias.imagen` + hasta 5 adicionales en la tabla `noticia_imagenes` (máximo 6) | La portada se usa en tarjetas y ticker sin JOIN extra; las adicionales tienen orden y pie de foto. No se usa `multimedia` para no mezclar la galería pública con las noticias. El límite lo controla el backend. |

## Preguntas pendientes con el docente

1. ¿React cuenta como la "Vista" de MVC, o exige plantillas servidas por el backend?
2. ¿Qué entiende por "etiquetas inteligentes"? Hoy son etiquetas en tabla propia con relación muchos a muchos.
