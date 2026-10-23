# Alcaldía App

## Descripción general

`alcaldia-app` es un portal web institucional y noticioso para la Alcaldía del
Municipio Rafael Rangel. La aplicación presenta información municipal,
contenidos de prensa y secciones de interés para la comunidad mediante una
interfaz responsive construida con React, Vite y Tailwind CSS.

Actualmente el proyecto está enfocado en resolver la necesidad de contar con
un punto central de comunicación digital para:

- Publicar noticias y titulares de la Alcaldía.
- Organizar la información por categorías temáticas.
- Promover la cultura, el turismo, los eventos y los deportes del municipio.
- Presentar información institucional.
- Facilitar una navegación clara desde computadores y dispositivos móviles.
- Proyectar una identidad visual oficial mediante el logo, los colores y las
  imágenes del municipio.

## Estructura del proyecto

```text
alcaldia-app/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── postcss.config.js
├── tailwind.config.js
├── README.md
├── ESTRUCTURA-PROYECTO.md
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── img/
│       ├── BanderaMunicipio1.jpg
│       ├── Cultura1.jpg
│       ├── Cultura2.jpg
│       ├── Deportes1.jpg
│       ├── Deportes2.jpg
│       ├── Deportes3.jpg
│       ├── Destacadas1.jpg
│       ├── Destacadas2.jpg
│       ├── Destacadas3.jpg
│       ├── Destacadas4.jpg
│       ├── Destacadas5.jpg
│       ├── EscudoMunicipio1.jpg
│       ├── Eventos1.jpg
│       ├── Eventos2.jpg
│       ├── Eventos3.jpg
│       ├── LogoAlcaldia1.png
│       ├── LogoMunicipio2.jpg
│       ├── Mundo1.jpg
│       ├── Mundo2.jpg
│       ├── Mundo3.jpg
│       ├── Mundo4.jpg
│       ├── Municipal1..jpg
│       ├── Pais1.jpg
│       ├── Pais2.jpg
│       ├── Pais3.jpg
│       ├── Personas1.jpg
│       ├── Turismo1.jpg
│       ├── Turismo2.jpg
│       └── Turismo3.jpg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── assets/
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    └── components/
        ├── Header.jsx
        ├── Footer.jsx
        ├── Titulares.jsx
        ├── Hero.jsx
        ├── Inicio.jsx
        ├── News.jsx
        ├── NewsCard.jsx
        ├── Cultura.jsx
        ├── Turismo.jsx
        ├── Mundo.jsx
        ├── Pais.jsx
        ├── Eventos.jsx
        ├── Deportes.jsx
        ├── Institucional.jsx
        └── Portales.jsx
```

## Función de cada parte

### Archivos de configuración

- **`package.json`**: define las dependencias y comandos del proyecto. Usa
  React 19, React Router, Vite, Tailwind CSS, ESLint, PostCSS y Autoprefixer.
- **`vite.config.js`**: configura el servidor y el proceso de construcción
  mediante Vite.
- **`tailwind.config.js`**: indica dónde buscar clases Tailwind y define la
  animación del ticker de noticias.
- **`postcss.config.js`**: conecta Tailwind CSS y Autoprefixer con el proceso
  de estilos.
- **`eslint.config.js`**: contiene las reglas de revisión estática del código.
- **`index.html`**: es el documento HTML base donde React monta la aplicación.

### Entrada y composición principal

- **`src/main.jsx`**: crea el punto de montaje de React, carga los estilos
  globales y renderiza `App` dentro de `StrictMode`.
- **`src/App.jsx`**: define la estructura común de la aplicación:
  `Header`, `Titulares`, el contenido de cada ruta y `Footer`. También
  configura las rutas con `react-router-dom`.

### Componentes de interfaz

- **`Header.jsx`**: muestra la marca institucional, la navegación principal,
  el menú móvil, el buscador visual y el menú de opciones administrativas.
- **`Titulares.jsx`**: presenta un ticker horizontal con noticias destacadas.
- **`Hero.jsx`**: contiene la sección visual principal de la página de inicio.
- **`Footer.jsx`**: contiene el cierre y la información inferior del portal.
- **`NewsCard.jsx`**: componente reutilizable para mostrar una noticia con
  imagen, etiquetas, título y fecha.
- **`Inicio.jsx`**: página principal; agrupa dos noticias por cada categoría y
  las presenta en bloques de Cultura, Turismo, Mundo, País, Eventos y Deportes.
- **`News.jsx`**: vista de detalle de una noticia, accesible mediante
  `/noticia/:id`.
- **`Cultura.jsx`, `Turismo.jsx`, `Mundo.jsx`, `Pais.jsx`, `Eventos.jsx` y
  `Deportes.jsx`**: páginas de las categorías temáticas.
- **`Institucional.jsx`**: sección destinada a la información oficial de la
  Alcaldía y del municipio.
- **`Portales.jsx`**: componente disponible para enlaces o accesos a otros
  portales institucionales.

### Estilos y recursos

- **`src/index.css`**: carga las capas base, componentes y utilidades de
  Tailwind, además de los estilos globales del documento.
- **`src/App.css`**: contiene estilos específicos adicionales de la
  aplicación.
- **`public/img/`**: almacena el logo, fotografías municipales y las imágenes
  empleadas por las noticias y secciones.
- **`src/assets/`**: contiene recursos incluidos por el sistema de módulos de
  Vite, incluyendo archivos generados por la plantilla inicial.

## Rutas actuales

| Ruta | Vista | Propósito |
| --- | --- | --- |
| `/` | `Inicio` | Portada con hero, categorías y noticias destacadas |
| `/cultura` | `Cultura` | Noticias y contenidos culturales |
| `/turismo` | `Turismo` | Información turística del municipio |
| `/mundo` | `Mundo` | Noticias de alcance internacional |
| `/pais` | `Pais` | Noticias de alcance nacional |
| `/eventos` | `Eventos` | Agenda y actividades comunitarias |
| `/deportes` | `Deportes` | Noticias y actividades deportivas |
| `/institucional` | `Institucional` | Información oficial de la Alcaldía |
| `/noticia/:id` | `News` | Detalle de una noticia seleccionada |

## Enfoque actual

El proyecto está construido como un **frontend de presentación y prototipo
funcional**:

1. React organiza la interfaz en componentes reutilizables.
2. React Router permite navegar entre la portada, las categorías y el detalle
   de una noticia sin recargar la aplicación.
3. Tailwind CSS concentra la construcción visual en clases utilitarias.
4. Vite proporciona el entorno de desarrollo y el build de producción.
5. Las imágenes locales de `public/img/` refuerzan la identidad visual
   municipal.
6. Los datos de noticias se encuentran definidos directamente dentro de los
   componentes; no existe todavía una API ni una base de datos.

## Problema que resuelve actualmente

La aplicación resuelve, en su estado actual, el problema de presentar de forma
ordenada y visualmente consistente la comunicación pública de la Alcaldía.
Antes de contar con este portal, las noticias, actividades y referencias
institucionales no tendrían necesariamente un espacio digital unificado dentro
de esta aplicación.

En concreto, actualmente permite:

- Reunir contenidos municipales en una portada única.
- Separar las publicaciones por temas para facilitar su descubrimiento.
- Mostrar titulares de forma visible y enlazarlos con una vista de detalle.
- Dar a la ciudadanía una navegación básica hacia información cultural,
  turística, deportiva, institucional y comunitaria.
- Mantener una experiencia visual adaptable a distintos tamaños de pantalla.

## Alcance y limitaciones actuales

El proyecto todavía no resuelve la administración integral de contenidos. Sus
principales limitaciones son:

- Las noticias, fechas, etiquetas y textos están escritos de forma estática en
  los componentes.
- No existe backend, API, base de datos ni panel administrativo funcional.
- El botón de administración solo muestra el mensaje de funcionalidad futura.
- El campo de búsqueda se muestra visualmente, pero todavía no ejecuta una
  búsqueda real.
- La vista `/noticia/:id` no consulta un artículo por su identificador; muestra
  contenido de demostración y genera una imagen remota.
- No hay autenticación, roles, publicación, edición ni moderación de noticias.
- No se observan todavía integraciones para redes sociales, formularios,
  servicios municipales o sistemas externos.

Por lo tanto, la solución actual debe entenderse como la base visual y
funcional de un portal institucional. El siguiente paso natural sería separar
los datos de la interfaz y conectarlos a un servicio de contenidos o a un
backend con autenticación y gestión editorial.
