# El proyecto explicado de forma sencilla

Guía para entender y explicar el portal de la Alcaldía del Municipio Rafael
Rangel sin necesidad de saber programar. Al final hay un glosario con las
palabras técnicas.

*Estado al 27/10/2026.*

---

## 1. ¿Qué es?

Es la **página web de noticias de la Alcaldía**. Tiene dos caras:

- **El portal público:** lo que ve cualquier ciudadano. Noticias, categorías
  (Cultura, Turismo, Deportes…), titulares destacados e información institucional.
- **El panel del administrador:** una zona privada, con usuario y contraseña,
  donde el personal de prensa escribe, edita, publica y elimina las noticias
  **sin tocar código**.

La idea central es que **todo lo que se ve en la página sale de una base de
datos**, y que el personal de la Alcaldía lo puede cambiar desde el panel.

---

## 2. Cómo está armado: la analogía del restaurante

El sistema tiene tres partes, como un restaurante:

| Restaurante | En el proyecto | Qué hace | Tecnología | Carpeta |
| --- | --- | --- | --- | --- |
| 🍽️ **El salón y el mesero** | **Frontend** | Es lo que el usuario ve y toca: pantallas, botones, formularios. Toma el "pedido" y lo lleva a la cocina. | React + Tailwind | `frontend/` |
| 👨‍🍳 **La cocina** | **Backend** | Recibe los pedidos, revisa que sean válidos y que quien pide tenga permiso, y prepara la respuesta. | Python (FastAPI) | `backend/` |
| 📦 **La despensa** | **Base de datos** | Guarda toda la información de forma ordenada: noticias, usuarios, categorías… | MySQL | `backend/database/` |

**Regla importante:** el mesero (frontend) nunca entra a la despensa. Siempre
le pide las cosas a la cocina (backend). Así nadie puede sacar o cambiar datos
sin pasar por los controles de seguridad.

```text
  Navegador del ciudadano            Servidor de la Alcaldía
 ┌────────────────────┐        ┌──────────────────┐       ┌─────────────┐
 │  FRONTEND (React)  │ ─────► │ BACKEND (Python) │ ────► │  BASE DE    │
 │  portal + panel    │ ◄───── │ revisa y responde│ ◄──── │ DATOS MySQL │
 └────────────────────┘  JSON  └──────────────────┘  SQL  └─────────────┘
```

Frontend y backend se comunican con mensajes en formato **JSON**: texto
ordenado que las dos partes entienden.

---

## 3. ¿Quién usa el sistema?

| Persona | Qué puede hacer |
| --- | --- |
| **Visitante** (cualquier ciudadano) | Leer las noticias publicadas. No necesita cuenta. |
| **Periodista** | Entra al panel. Escribe y edita noticias, pero solo como **borrador**: no puede publicarlas ni borrarlas. |
| **Editor** | Todo lo del periodista y además **publica**, despublica y archiva noticias. No puede eliminar. |
| **Administrador** | Puede hacer todo, incluido **eliminar** y, más adelante, gestionar usuarios. |

Esto se llama **roles y permisos**. Cada rol tiene una lista de cosas
permitidas guardada en la base de datos, por ejemplo `noticias.publicar`.
Hoy existen **3 roles** y **24 permisos**.

---

## 4. Un ejemplo completo: publicar una noticia

1. **La periodista entra al panel** (`/admin`) con su correo y contraseña.
   El backend comprueba la contraseña y abre una sesión.
2. **Escribe la noticia**: título, texto, categoría, etiquetas ("Cultura,
   Eventos") y una foto de portada. Pulsa *Guardar*.
3. **El backend revisa todo:**
   - ¿Tiene sesión y permiso para crear noticias?
   - ¿El título tiene al menos 5 letras? ¿Eligió una categoría?
   - ¿La foto es una imagen real (JPG, PNG o WEBP) y pesa menos de 5 MB?
     Si es muy grande, la achica.
4. **Se guarda en la base de datos como borrador.** Las etiquetas nuevas se
   crean solas y las repetidas no se duplican. Queda anotado en la
   **auditoría** quién la creó y cuándo.
5. **El editor la revisa y pulsa *Publicar*.** Se guarda la fecha de
   publicación.
6. **Un ciudadano abre el portal.** El frontend le pide al backend "las
   noticias publicadas". El backend las busca en la base de datos y la noticia
   nueva aparece en la portada y en su categoría.
7. **Si el editor la despublica**, desaparece del portal la próxima vez que
   alguien cargue la página o vuelva a la pestaña.

---

## 5. La base de datos, en simple

Una base de datos es como un conjunto de **tablas de Excel conectadas entre
sí**. Este proyecto tiene **18 tablas**, agrupadas así:

| Grupo | Tablas | Para qué |
| --- | --- | --- |
| 👤 Usuarios y seguridad | `usuarios`, `roles`, `permisos`, `rol_permiso`, `registro_accesos`, `auditoria` | Quién entra, qué puede hacer, cada intento de entrada y cada cambio realizado |
| 📰 Noticias | `noticias`, `categorias`, `etiquetas`, `noticia_etiqueta`, `noticia_imagenes` | Las noticias, sus secciones, sus palabras clave y sus fotos |
| 📅 Eventos | `eventos`, `evento_etiqueta` | La agenda municipal |
| 🏛️ Institucional | `secciones_institucionales` | Misión, visión, historia, alcalde… |
| 🖼️ Galería | `albumes`, `multimedia` | Álbumes de fotos y videos |
| ⚙️ Sitio | `configuracion_sitio`, `menu_items` | Teléfono, correo, redes sociales, menú |

**¿Cómo se conectan?** Con números de identificación (`id`). Por ejemplo, una
noticia no repite el nombre de su categoría: guarda `categoria_id = 1`, y la
tabla `categorias` dice que el 1 es "Cultura". Para mostrar la noticia con su
categoría, la base **junta** las dos tablas. A eso se le llama **JOIN**, y el
docente lo pidió expresamente.

**Etiquetas inteligentes:** una noticia puede tener varias etiquetas y una
etiqueta puede estar en muchas noticias. Para eso existe una tabla intermedia,
`noticia_etiqueta`. Al escribir "cultura, CULTURA, Cultura", el sistema
entiende que es la misma etiqueta y la guarda una sola vez.

**Borrado lógico:** cuando se "elimina" una noticia, no se borra de verdad: se
marca con una fecha de eliminación y deja de mostrarse. Así se puede recuperar
y no se pierde el historial.

Más detalle técnico en [base-de-datos.md](base-de-datos.md).

---

## 6. Cómo se organiza el código: MVC y POO

El docente pidió **POO** (programación orientada a objetos) y **MVC**.
El backend está dividido en tres tipos de piezas, cada una con un solo trabajo:

| Letra | Pieza | Qué hace | Ejemplo | Dónde |
| --- | --- | --- | --- | --- |
| **M** | Modelo | Habla con la base de datos | `Noticia.publicadas()` busca las noticias visibles | `backend/app/models/` |
| **V** | Vista | Decide cómo se presenta la respuesta (qué datos salen) | `NoticiaPublicaView` no muestra quién creó la noticia | `backend/app/views/` |
| **C** | Controlador | Recibe el pedido, revisa permisos y coordina | `NoticiaController.store()` recibe el formulario de "crear noticia" | `backend/app/controllers/` |

Todas estas piezas son **clases** (POO). Por ejemplo, todos los modelos
heredan de una clase base `Model`, que ya sabe buscar, crear, editar y borrar.
Cada modelo solo agrega lo propio.

En el frontend, React muestra en pantalla los datos que entrega el backend.

---

## 7. Seguridad, explicada sin tecnicismos

| Riesgo | Cómo se protege |
| --- | --- |
| Alguien roba la base de datos y ve las contraseñas | Las contraseñas no se guardan: se guarda un **hash**, una "huella" que no se puede revertir (bcrypt). |
| Alguien prueba miles de contraseñas | Tras **5 intentos fallidos**, la cuenta se bloquea **15 minutos**. Cada intento queda registrado con su IP. |
| Alguien escribe código malicioso en un buscador o formulario para atacar la base de datos (**inyección SQL**) | Todas las consultas usan **parámetros**: lo que escribe el usuario nunca se mezcla con las órdenes a la base de datos. |
| Una página falsa intenta hacer cambios en nombre del administrador | Cada cambio exige un **token CSRF**, un código secreto que la página falsa no conoce. |
| Alguien sube un "archivo de imagen" que en realidad es un virus | La imagen se abre, se comprueba que es una imagen real y se vuelve a guardar desde cero. |
| Un periodista intenta publicar o borrar sin permiso | El **backend** revisa el permiso en cada acción. Ocultar el botón no basta, y el sistema no depende de eso. |
| No se sabe quién cambió algo | La **auditoría** guarda quién hizo qué, cuándo, y cómo estaba antes y después. |

---

## 8. ¿Qué está hecho y qué falta?

### ✅ Hecho

| Parte | Estado |
| --- | --- |
| Base de datos completa (18 tablas) con datos de ejemplo | ✅ |
| Login seguro con roles y permisos (administrador, editor, periodista) | ✅ |
| Bloqueo por intentos fallidos, registro de accesos y auditoría | ✅ |
| Panel: crear, editar, publicar, despublicar, archivar y eliminar noticias, con foto de portada | ✅ |
| Panel: buscar y filtrar noticias por categoría y estado | ✅ |
| Etiquetas inteligentes en las noticias | ✅ |
| Portal conectado a la base de datos: portada, carrusel de destacadas, ticker de titulares, páginas de categoría y detalle de la noticia | ✅ |
| Documentación en `docs/` | ✅ |
| Pruebas manuales del sistema completo contra MySQL (78 verificaciones, todas OK) | ✅ |

### ⏳ Falta

Ordenado por importancia para la entrega:

| # | Qué falta | Por qué importa | Lo que ya existe |
| --- | --- | --- | --- |
| 1 | **Módulo Eventos** (agenda con fecha, hora y lugar) | El docente pide **4 módulos** además de usuarios. Hoy solo está completo Noticias (1 de 4). | La tabla `eventos` ya está. Hoy la página "Eventos" muestra noticias de la categoría Eventos. |
| 2 | **Módulo Institucional** (misión, visión, historia, alcalde) | Segundo módulo. Además, la página Institucional hoy tiene el texto fijo en el código. | Tabla `secciones_institucionales` lista. |
| 3 | **Módulo Galería** (álbumes de fotos) | Tercer módulo. | Tablas `albumes` y `multimedia` listas. |
| 4 | **Configuración del sitio y menú** (teléfono, correo, redes, enlaces del menú) | Cuarto módulo, y necesario para que *toda* la información salga de la base de datos. Hoy el Header y el Footer tienen los textos fijos. | Tablas `configuracion_sitio` y `menu_items` listas **y con datos**. |
| 5 | **Gestión de usuarios desde el panel** (crear usuarios, cambiar rol, desactivar) | Hoy los usuarios se crean con un comando en la consola. | Tablas de usuarios, roles y permisos listas. |
| 6 | **Varias fotos por noticia** (de 4 a 6) | Lo pidió el equipo. | Tabla `noticia_imagenes` lista y explicada en [base-de-datos.md §7.9](base-de-datos.md#79-imágenes-de-una-noticia). |
| 7 | **Buscador del portal** y páginas por etiqueta | El buscador del header todavía no busca. | El backend ya sabe buscar por texto y por etiqueta; falta conectar la pantalla. |
| 8 | **Ver la auditoría y los accesos** desde el panel; **cambiar la contraseña** | Útil para el administrador y para mostrar la seguridad. | Los datos ya se guardan. |
| 9 | Gestionar categorías y etiquetas desde el panel; recuperar noticias eliminadas | Comodidad del administrador. | — |
| 10 | **Puesta en producción**: publicar en un servidor real con HTTPS y un usuario de MySQL propio (no `root`), y hacer copias de seguridad | Para que funcione fuera de la computadora de desarrollo. | Las instrucciones base están en [instalacion.md](instalacion.md). |
| 11 | **Pruebas automáticas** guardadas en el proyecto | Las pruebas se hicieron, pero no quedaron como archivos que se puedan volver a ejecutar. | — |
| 12 | Actualizar el `README.md` de la raíz | Todavía describe la estructura anterior del proyecto. | — |

**Preguntas pendientes con el docente:**
1. ¿Cuenta React como la "Vista" de MVC, o exige páginas generadas por el backend?
2. ¿Qué entiende exactamente por "etiquetas inteligentes"? Hoy son etiquetas en
   su propia tabla, que se crean solas, no se repiten y se cuentan con JOIN.

---

## 9. Cómo encenderlo (desarrollo)

Se necesitan **dos ventanas de terminal**, una para cada parte, con MySQL encendido.

**Ventana 1: backend (la cocina)**
```powershell
cd backend
.venv\Scripts\python -m uvicorn main:app --port 8000 --reload
```

**Ventana 2: frontend (el salón)**
```powershell
cd frontend
npm run dev
```

Luego abrir en el navegador:
- Portal: http://localhost:5173
- Panel: http://localhost:5173/admin (o el menú ⋮ → "Soy Administrador")

Crear un usuario administrador (una sola vez):
```powershell
cd backend
.venv\Scripts\python -m scripts.crear_admin
```

La instalación desde cero está en [instalacion.md](instalacion.md).

---

## 10. Preguntas que pueden hacer en la presentación

**¿Por qué no se conecta React directo a la base de datos?**
Porque el código de React lo descarga cualquier visitante. Si tuviera la
contraseña de la base de datos, cualquiera podría leerla y borrar todo. El
backend es el único que tiene esa llave, y antes de usarla revisa los permisos.

**¿Dónde están los JOINs?**
Por ejemplo, al mostrar una noticia se juntan 5 tablas: `noticias`,
`categorias`, `usuarios`, `noticia_etiqueta` y `etiquetas`. También al
calcular los permisos de un usuario: `usuarios` + `roles` + `rol_permiso` +
`permisos`. El código está en `backend/app/models/`.

**¿Cómo se evita la inyección SQL?**
Con consultas parametrizadas. Lo que escribe el usuario se envía aparte, como
un dato, nunca como parte de la orden SQL. Es el equivalente a las
"sentencias preparadas" de PDO en PHP.

**¿Qué pasa si se elimina una noticia por error?**
No se pierde: es un borrado lógico. Sigue en la base con una fecha de
eliminación y queda registrado en la auditoría quién la eliminó.

**¿Por qué una noticia despublicada desaparece del portal?**
El portal solo pide al backend las noticias con estado "publicada", y el
navegador no guarda copias viejas. Al recargar o volver a la pestaña, la
lista llega actualizada.

**¿Dónde está la POO?**
Cada modelo, controlador, vista, formulario y servicio es una clase. Los
modelos heredan de la clase base `Model` (herencia) y cada uno solo agrega sus
propias consultas.

---

## 11. Glosario

| Palabra | Significado sencillo |
| --- | --- |
| **Frontend** | La parte que se ve en el navegador: pantallas y botones. |
| **Backend** | El programa que corre en el servidor: recibe pedidos, valida y responde. |
| **Base de datos** | Donde se guarda la información en tablas ordenadas. |
| **API** | El "menú" de pedidos que el backend acepta. Ej.: "dame las noticias publicadas". |
| **Endpoint / ruta** | Cada pedido concreto de la API, como `/api/portal/noticias`. |
| **JSON** | Formato de texto con el que se mandan los datos. Ej.: `{"titulo": "Feria"}`. |
| **MVC** | Forma de ordenar el código en Modelo (datos), Vista (presentación) y Controlador (coordinación). |
| **POO** | Programar con "clases": moldes que agrupan datos y acciones, como `Noticia`. |
| **Herencia** | Una clase que reutiliza lo de otra. `Noticia` hereda de `Model`. |
| **Tabla** | Como una hoja de Excel: filas (registros) y columnas (campos). |
| **id** | Número único que identifica cada fila de una tabla. |
| **Clave foránea** | Columna que apunta al `id` de otra tabla. Así se conectan. |
| **JOIN** | Juntar dos o más tablas en una sola consulta usando esas claves. |
| **Muchos a muchos** | Relación donde cada lado puede tener varios del otro (noticias ↔ etiquetas). Necesita una tabla intermedia. |
| **Slug** | El título convertido en texto para direcciones web: `feria-de-betijoque`. |
| **Borrador / publicada / archivada** | Estados de una noticia: no visible, visible, y guardada pero ya no visible. |
| **Borrado lógico** | Marcar algo como eliminado sin borrarlo de verdad. |
| **Hash** | "Huella" de la contraseña. Sirve para comprobarla, pero no permite recuperarla. |
| **Sesión** | Lo que recuerda que ya iniciaste sesión, guardado en una cookie segura. |
| **CSRF** | Ataque en el que otra página intenta hacer cambios usando tu sesión. Se bloquea con un token secreto. |
| **Inyección SQL** | Ataque que mete órdenes en un formulario para manipular la base de datos. Se bloquea con consultas parametrizadas. |
| **Auditoría** | Registro de quién hizo qué y cuándo. |
| **Rol / permiso** | Tipo de usuario / acción concreta que puede realizar. |
