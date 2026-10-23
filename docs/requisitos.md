# Requisitos del docente

| Requisito | Cómo se cumple | Estado |
| --- | --- | --- |
| Python o PHP | Python 3.11 + FastAPI | ✅ |
| Programación orientada a objetos | Modelos, controladores, vistas, validadores y servicios son clases. Los modelos heredan de `Model`. | ✅ |
| Arquitectura MVC | `app/models`, `app/controllers`, `app/views` (JSON) en el backend. React muestra esos datos. Ver [arquitectura.md](arquitectura.md). | ✅ (falta confirmar, ver abajo) |
| Interacción segura con la BD | Todas las consultas usan parámetros enlazados (`:nombre`) con SQLAlchemy, el equivalente a las sentencias preparadas de PDO. Los nombres de tabla y columna salen de la clase, nunca del usuario. | ✅ |
| Uso de JOINs | Listado y detalle de noticias (noticias + categorías + usuarios + etiquetas), permisos del usuario (usuarios + roles + rol_permiso + permisos), conteo por categoría, etiquetas más usadas, vista `v_noticias_publicadas`, carga de datos iniciales. Ver [base-de-datos.md](base-de-datos.md). | ✅ |
| Etiquetas inteligentes | Tabla `etiquetas` + tabla intermedia `noticia_etiqueta` (muchos a muchos). Se crean solas al escribirlas, no se repiten y se cuentan con JOIN. | ✅ (falta confirmar, ver abajo) |
| Mínimo 4 módulos además de usuarios | Noticias (Fase 1). Eventos, Institucional, Galería y Configuración del sitio (Fase 3). Las tablas de los 4 ya están creadas. | 🚧 1 de 4 |
| Toda la información sale de la BD y el admin la cambia desde el sistema | Las noticias del portal (portada, carrusel, ticker, categorías y detalle) ya salen de la BD. Header, Footer e Institucional se conectan en la Fase 3. | 🚧 |

## Por confirmar con el docente

1. **¿React cuenta como la "Vista" de MVC?** El backend tiene vistas JSON
   (`app/views`) y React muestra los datos. Si el docente exige plantillas
   HTML servidas por el backend, habría que agregar Jinja2.
2. **¿Las "etiquetas inteligentes" se refieren a etiquetas de noticias en
   tabla propia?** Ya está hecho así. Si se refería a otra cosa (por ejemplo
   vistas, disparadores o procedimientos almacenados), se agrega en la
   siguiente fase.
