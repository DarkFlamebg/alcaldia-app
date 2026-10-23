# Plan por fases

Estados: ✅ terminada · 🚧 en curso · ⏳ pendiente

## ✅ Fase 1 · BD, núcleo MVC, login y CRUD de noticias

**Backend**
- Base de datos MySQL completa (diseño del equipo, corregido): 17 tablas para
  todos los módulos y la vista `v_noticias_publicadas`. Ver [base-de-datos.md](base-de-datos.md).
- Roles y permisos en tablas (administrador, editor, periodista), registro de
  accesos, auditoría y borrado lógico.
- Datos iniciales: las 6 categorías y las 12 noticias que estaban escritas en
  `Inicio.jsx`, con sus imágenes y etiquetas.
- Núcleo MVC: clase base `Model`, clase `Database` con consultas
  parametrizadas, controladores como clases, vistas JSON.
- Seguridad: bcrypt, sesión en cookie firmada HttpOnly, token CSRF, límite de
  intentos de login, validación de imágenes con Pillow, límite de tamaño de
  petición y encabezados de seguridad.
- API del panel: login/logout, listar con filtros y paginación, crear, editar,
  publicar/despublicar/archivar y eliminar noticias. Cada acción exige su permiso.
- Scripts: `init_db` (crea la BD) y `crear_admin` (crea usuarios del panel).

**Frontend**
- Panel en `/admin`: login, listado con filtros, formulario de crear/editar
  con subida de imagen y vista previa, sugerencias de etiquetas.
- El botón "Soy Administrador" del header lleva al panel.
- Vite reenvía `/api` y `/static` al backend en desarrollo.

**Queda fuera de esta fase:** el portal público sigue mostrando los datos
escritos en los componentes. Se conecta en la Fase 2.

**Pendiente de la Fase 1:** imágenes adicionales por noticia (la tabla
`noticia_imagenes` ya existe; falta backend y panel, ver
[base-de-datos.md §7.9](base-de-datos.md#79-imágenes-de-una-noticia)).

## 🚧 Fase 2 · API pública y conexión del portal

**Hecho (2026-10-23)**
- API pública de solo lectura en `/api/portal/*` (ver [api.md](api.md#portal-público)).
- Conectados a la BD: `Inicio.jsx`, `Hero.jsx` (carrusel de destacadas),
  `Titulares.jsx` (ticker), las 6 páginas de categoría (con
  `portal/ListadoCategoria.jsx`) y `News.jsx` (detalle).
- Se quitaron los arreglos de noticias escritos en los componentes.
- La noticia se abre por `id` (`/noticia/12`).
- Si el administrador publica o despublica, el portal lo refleja al recargar o
  al volver a la pestaña.

**Falta**
- Header y Footer siguen con textos fijos (se conectan con
  `configuracion_sitio` y `menu_items` en la Fase 3).
- Buscador del header y páginas por etiqueta (la API ya acepta `q` y `etiqueta`).

## ⏳ Fase 3 · Módulos 2, 3 y 4

Las tablas ya existen desde la Fase 1. Falta el modelo, controlador, vista JSON
y pantalla en el panel de cada uno:
- **Eventos:** agenda con fecha, hora, lugar e imagen.
- **Institucional:** autoridades, historia, misión/visión, organigrama.
- **Galería:** álbumes y fotos.
- **Configuración del sitio y menú:** textos del header, footer, redes y
  contacto (`configuracion_sitio`, `menu_items`, ya con datos). Es necesario
  para cumplir que *toda* la información salga de la BD.

## ⏳ Fase 4 · Usuarios, búsqueda y etiquetas

- Pantalla para gestionar usuarios, roles y permisos (hoy se crean con `crear_admin`).
- Pantalla para consultar la auditoría y el registro de accesos.
- Obligar a cambiar la contraseña cuando `debe_cambiar_clave = 1`.
- Búsqueda real en el portal (el buscador del header).
- Páginas por etiqueta y gestión de etiquetas desde el panel.
- Revisión final de seguridad y despliegue.
