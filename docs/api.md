# API del backend

Todas las respuestas son JSON. Con `APP_DEBUG=true`, la documentación
interactiva está en `http://127.0.0.1:8000/docs`.

**Reglas generales**
- Las peticiones que modifican datos (`POST`, `PUT`, `PATCH`, `DELETE`) llevan
  el header `X-CSRF-Token`.
- Las rutas `/api/admin/*` necesitan sesión iniciada. Sin sesión responden `401`.
- Cada acción exige un permiso del rol (tabla `permisos`). Sin él responde `403`.
- Errores de formulario: `422` con `{"detail": "...", "errores": {"campo": "mensaje"}}`.
- Otros errores: `{"detail": "mensaje"}` (`401`, `403`, `404`, `413`, `429`).

## Autenticación

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| GET | `/api/auth/csrf` | — | `{csrf_token}` |
| GET | `/api/auth/me` | — | `{usuario \| null, csrf_token}` |
| POST | `/api/auth/login` | `{email, password}` | `{usuario, csrf_token}` (token nuevo) |
| POST | `/api/auth/logout` | — | `{ok, csrf_token}` |

`usuario` = `{id, nombre, email, rol, permisos: ["noticias.crear", ...], debe_cambiar_clave}`.

**Login bloqueado (`429`):** 5 contraseñas incorrectas seguidas bloquean la
cuenta 15 minutos. Un correo que no existe recibe la misma respuesta tras 5
intentos, y una IP con 20 fallos en 15 minutos también se bloquea. Todo intento
queda en `registro_accesos`.

## Noticias (panel)

| Método | Ruta | Permiso | Notas |
| --- | --- | --- | --- |
| GET | `/api/admin/noticias?q=&categoria=&estado=&pagina=` | `noticias.ver` | 15 por página. `{data: [...], meta: {pagina, por_pagina, total, paginas}}` |
| GET | `/api/admin/noticias/{id}` | `noticias.ver` | `{data}` |
| POST | `/api/admin/noticias` | `noticias.crear` | `multipart/form-data`. `201` + `{data}` |
| PUT | `/api/admin/noticias/{id}` | `noticias.editar` | `multipart/form-data`. La imagen es opcional. |
| PATCH | `/api/admin/noticias/{id}/estado` | `noticias.publicar` | `{estado: "publicada" \| "borrador" \| "archivada"}` |
| DELETE | `/api/admin/noticias/{id}` | `noticias.eliminar` | Borrado lógico. `204` |

Sin `noticias.publicar` se puede crear y editar, pero no cambiar el estado
(el formulario responde `422` en `estado`). Cada cambio queda en `auditoria`.

**Campos del formulario:** `titulo` (5–200), `subtitulo` (≤300), `categoria_id`,
`contenido` (≥20), `autor` (≤120, por defecto "Prensa Alcaldía"), `etiquetas`
(texto separado por comas, máximo 10), `destacada` (`1` si está marcada),
`estado` (`borrador`, `publicada` o `archivada`), `imagen` (archivo; obligatorio al crear).

**Noticia en JSON:**
```json
{
  "id": 1,
  "titulo": "Inauguración de la nueva galería de arte municipal",
  "subtitulo": "…",
  "slug": "inauguracion-de-la-nueva-galeria-de-arte-municipal",
  "contenido": "Párrafo 1\n\nPárrafo 2",
  "imagen": "Cultura1.jpg",
  "imagen_url": "/static/uploads/noticias/Cultura1.jpg",
  "autor": "Prensa Alcaldía",
  "destacada": true,
  "estado": "publicada",
  "categoria": {"id": 1, "nombre": "Cultura", "slug": "cultura"},
  "etiquetas": ["Cultura"],
  "creado_por": {"id": 1, "nombre": "Sistema"},
  "actualizado_por": null,
  "publicada_en": "2026-10-19T09:00:00",
  "creado_en": "…",
  "actualizado_en": "…"
}
```

## Catálogos (panel)

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/api/admin/categorias` | `{data: [{id, nombre, slug, total_noticias, publicadas}]}` |
| GET | `/api/admin/etiquetas?limite=20` | `{data: [{id, nombre, slug, usos}]}` |

## Portal público

Sin sesión ni CSRF, solo `GET`. Solo devuelve noticias **publicadas**, no
eliminadas y de categorías activas. Todas las respuestas `/api` llevan
`Cache-Control: no-store`, así un cambio del panel se ve al recargar.

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/api/portal/inicio?por_categoria=2` | `{data: [{nombre, slug, noticias: [...]}]}`: las N más recientes de cada categoría |
| GET | `/api/portal/destacadas?limite=5` | `{data: [...]}`: destacadas (carrusel y ticker). Si no hay destacadas, las últimas publicadas. |
| GET | `/api/portal/noticias?categoria=&etiqueta=&q=&pagina=&por_pagina=` | `{data, meta}`. `por_pagina` de 1 a 24. `categoria` y `etiqueta` son slugs. |
| GET | `/api/portal/noticias/{id}` | `{data}` con `contenido`. `404` si no existe o no está publicada. |

**Noticia pública** (no incluye estado, creador ni fechas internas):
```json
{
  "id": 1, "titulo": "…", "subtitulo": "…", "slug": "…",
  "extracto": "subtítulo o primeros 180 caracteres del contenido",
  "imagen_url": "/static/uploads/noticias/Cultura1.jpg",
  "autor": "Prensa Alcaldía", "destacada": true,
  "categoria": {"nombre": "Cultura", "slug": "cultura"},
  "etiquetas": ["Cultura"],
  "publicada_en": "2026-10-19T09:00:00",
  "contenido": "solo en el detalle"
}
```

## Archivos

Las imágenes subidas se sirven en `/static/uploads/noticias/{archivo}`.
