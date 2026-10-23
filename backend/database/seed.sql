-- =====================================================================
-- Datos iniciales
-- Ejecutar después de schema.sql. Usa INSERT IGNORE: se puede ejecutar
-- varias veces sin duplicar nada.
-- El administrador real se crea aparte con: python -m scripts.crear_admin
-- =====================================================================

USE alcaldia_db;

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
  ('administrador', 'Acceso total: contenido, usuarios, configuración y auditoría.'),
  ('editor',        'Crea, edita y publica contenido. No elimina ni gestiona usuarios.'),
  ('periodista',    'Redacta y edita contenido como borrador. Un editor lo publica.');

-- ---------------------------------------------------------------------
-- Permisos (modulo.accion)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO permisos (codigo, modulo, descripcion) VALUES
  ('noticias.ver',          'noticias',      'Ver noticias en el panel'),
  ('noticias.crear',        'noticias',      'Crear noticias'),
  ('noticias.editar',       'noticias',      'Editar noticias'),
  ('noticias.publicar',     'noticias',      'Publicar, despublicar y archivar noticias'),
  ('noticias.eliminar',     'noticias',      'Eliminar noticias'),
  ('eventos.ver',           'eventos',       'Ver eventos en el panel'),
  ('eventos.crear',         'eventos',       'Crear eventos'),
  ('eventos.editar',        'eventos',       'Editar eventos'),
  ('eventos.publicar',      'eventos',       'Publicar, despublicar y archivar eventos'),
  ('eventos.eliminar',      'eventos',       'Eliminar eventos'),
  ('galeria.ver',           'galeria',       'Ver álbumes en el panel'),
  ('galeria.crear',         'galeria',       'Crear álbumes y subir fotos'),
  ('galeria.editar',        'galeria',       'Editar álbumes y fotos'),
  ('galeria.publicar',      'galeria',       'Publicar, despublicar y archivar álbumes'),
  ('galeria.eliminar',      'galeria',       'Eliminar álbumes y fotos'),
  ('institucional.ver',     'institucional', 'Ver secciones institucionales'),
  ('institucional.editar',  'institucional', 'Editar misión, visión, historia, etc.'),
  ('configuracion.ver',     'configuracion', 'Ver la configuración del sitio'),
  ('configuracion.editar',  'configuracion', 'Editar datos del sitio y el menú'),
  ('usuarios.ver',          'usuarios',      'Ver usuarios'),
  ('usuarios.crear',        'usuarios',      'Crear usuarios'),
  ('usuarios.editar',       'usuarios',      'Editar usuarios, roles y contraseñas'),
  ('usuarios.eliminar',     'usuarios',      'Desactivar o eliminar usuarios'),
  ('auditoria.ver',         'auditoria',     'Ver la auditoría y el registro de accesos');

-- administrador: todos los permisos
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'administrador';

-- editor: todo el contenido menos eliminar; solo puede ver la configuración
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permisos p
  ON (p.modulo IN ('noticias', 'eventos', 'galeria', 'institucional') AND p.codigo NOT LIKE '%.eliminar')
  OR p.codigo = 'configuracion.ver'
WHERE r.nombre = 'editor';

-- periodista: ver, crear y editar noticias, eventos y galería (sin publicar)
INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permisos p
  ON p.modulo IN ('noticias', 'eventos', 'galeria')
 AND SUBSTRING_INDEX(p.codigo, '.', -1) IN ('ver', 'crear', 'editar')
WHERE r.nombre = 'periodista';

-- ---------------------------------------------------------------------
-- Usuario "Sistema": autor de los datos de ejemplo.
-- Está inactivo y su contraseña no es un hash válido: nadie puede entrar con él.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO usuarios (rol_id, nombre, email, password_hash, activo)
SELECT id, 'Sistema', 'sistema@rafaelrangel.local', '!', FALSE
FROM roles
WHERE nombre = 'administrador';

SET @sistema = (SELECT id FROM usuarios WHERE email = 'sistema@rafaelrangel.local');

-- ---------------------------------------------------------------------
-- Configuración del sitio (los datos que hoy están en Header y Footer)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO configuracion_sitio (clave, valor, descripcion) VALUES
  ('nombre_sitio', 'Alcaldía de Rafael Rangel',                        'Nombre que aparece en el encabezado'),
  ('nombre_oficial', 'Alcaldía Bolivariana del Municipio Rafael Rangel', 'Nombre legal (pie de página)'),
  ('lema',         'Historia, Tradición y Desarrollo',                 'Frase bajo el nombre'),
  ('logo',         '/img/LogoAlcaldia1.png',                           'Ruta del logo'),
  ('direccion',    'Avenida 5, vía Betijoque - Valera, frente a la Plaza Bolívar, Sector Betijoque, Estado Trujillo.', 'Dirección'),
  ('telefono',     '(0271) 663-0642 / 663-2100',                       'Teléfonos de contacto'),
  ('correo',       'prensa@rafaelrangel.gob.ve',                       'Correo de contacto'),
  ('facebook',     'https://facebook.com/AlcaldiaRafaelRangel',        'Enlace a Facebook'),
  ('instagram',    'https://instagram.com/alcaldiarafael',             'Enlace a Instagram'),
  ('x',            'https://x.com/ABBetijoque',                        'Enlace a X (Twitter)'),
  ('rif',          'G-20000000-0',                                     'RIF de la alcaldía');

-- ---------------------------------------------------------------------
-- Menú principal (el mismo de Header.jsx)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO menu_items (etiqueta, ruta, orden) VALUES
  ('Inicio',        '/',              1),
  ('Cultura',       '/cultura',       2),
  ('Turismo',       '/turismo',       3),
  ('Mundo',         '/mundo',         4),
  ('País',          '/pais',          5),
  ('Eventos',       '/eventos',       6),
  ('Deportes',      '/deportes',      7),
  ('Institucional', '/institucional', 8);

-- ---------------------------------------------------------------------
-- Categorías y etiquetas de noticias
-- ---------------------------------------------------------------------
INSERT IGNORE INTO categorias (nombre, slug, orden) VALUES
  ('Cultura',  'cultura',  1),
  ('Turismo',  'turismo',  2),
  ('Mundo',    'mundo',    3),
  ('País',     'pais',     4),
  ('Eventos',  'eventos',  5),
  ('Deportes', 'deportes', 6);

INSERT IGNORE INTO etiquetas (nombre, slug) VALUES
  ('Cultura',   'cultura'),
  ('Eventos',   'eventos'),
  ('Turismo',   'turismo'),
  ('Economía',  'economia'),
  ('Mundial',   'mundial'),
  ('País',      'pais'),
  ('Obras',     'obras'),
  ('Comunidad', 'comunidad'),
  ('Deportes',  'deportes');

-- ---------------------------------------------------------------------
-- Noticias de ejemplo (las mismas de Inicio.jsx)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO noticias
  (categoria_id, titulo, subtitulo, slug, contenido, imagen, autor, destacada, estado, publicada_en, creado_por)
VALUES
  ((SELECT id FROM categorias WHERE slug = 'cultura'),
   'Inauguración de la nueva galería de arte municipal',
   'Más de 20 artistas locales exponen sus obras en la nueva sala del centro de Betijoque.',
   'inauguracion-de-la-nueva-galeria-de-arte-municipal',
   'Con la participación de más de 20 artistas locales, se abrió al público la nueva sala de exposiciones en el centro de Betijoque.\n\nLa galería funcionará de martes a domingo y tendrá una agenda de muestras rotativas dedicadas al talento rangeliano.',
   'Cultura1.jpg', 'Prensa Alcaldía', 1, 'publicada', '2026-10-19 09:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'cultura'),
   'Presentación de la Orquesta Sinfónica Infantil en la plaza',
   'Niños y jóvenes del municipio ofrecieron un concierto al aire libre.',
   'presentacion-de-la-orquesta-sinfonica-infantil-en-la-plaza',
   'Más de 60 niños en escena interpretaron el Alma Llanera y piezas clásicas universales, y se ganaron la ovación de pie de los asistentes.\n\nLa presentación forma parte del programa municipal de formación musical gratuita.',
   'Cultura2.jpg', 'Dirección de Cultura', 0, 'publicada', '2026-10-18 18:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'turismo'),
   'Nuevas rutas guiadas por el casco histórico de Betijoque',
   'Los recorridos incluyen la iglesia, la plaza Bolívar y las casas coloniales.',
   'nuevas-rutas-guiadas-por-el-casco-historico-de-betijoque',
   'La Alcaldía presentó tres nuevas rutas guiadas por el casco histórico de Betijoque, pensadas para visitantes y estudiantes.\n\nLos recorridos salen los fines de semana desde la plaza Bolívar y son gratuitos.',
   'Turismo2.jpg', 'Prensa Alcaldía', 1, 'publicada', '2026-10-17 10:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'turismo'),
   'Posadas locales reportan alta ocupación este fin de semana',
   'El turismo religioso hacia Isnotú impulsa la economía local.',
   'posadas-locales-reportan-alta-ocupacion-este-fin-de-semana',
   'Las posadas del municipio reportaron una alta ocupación durante el fin de semana, impulsada por las visitas a Isnotú y las actividades culturales.\n\nLos prestadores de servicio destacan el aumento de visitantes de otros estados.',
   'Turismo3.jpg', 'Prensa Alcaldía', 0, 'publicada', '2026-10-16 08:30:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'mundo'),
   'Acuerdos internacionales impulsan proyectos de desarrollo regional',
   NULL,
   'acuerdos-internacionales-impulsan-proyectos-de-desarrollo-regional',
   'Nuevos acuerdos de cooperación internacional abren la puerta a proyectos de desarrollo en la región andina.\n\nLas iniciativas se enfocan en agricultura, agua potable y formación técnica.',
   'Mundo3.jpg', 'Prensa Alcaldía', 0, 'publicada', '2026-10-15 11:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'mundo'),
   'Delegación local participa en encuentro cultural internacional',
   NULL,
   'delegacion-local-participa-en-encuentro-cultural-internacional',
   'Una delegación de artistas y cultores del municipio participa en un encuentro cultural internacional, donde presenta las tradiciones trujillanas.\n\nLa agenda incluye música, danza y una muestra de artesanía local.',
   'Mundo4.jpg', 'Prensa Alcaldía', 0, 'publicada', '2026-10-14 15:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'pais'),
   'Avanza la 2da Consulta Popular Nacional en todo el territorio',
   NULL,
   'avanza-la-2da-consulta-popular-nacional-en-todo-el-territorio',
   'La 2da Consulta Popular Nacional avanza en todo el territorio con alta participación de las comunidades.\n\nEn el municipio se habilitaron puntos de votación en las cuatro parroquias.',
   'Pais2.jpg', 'Prensa Alcaldía', 1, 'publicada', '2026-10-13 07:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'pais'),
   'Nuevos recursos aprobados para infraestructura municipal',
   NULL,
   'nuevos-recursos-aprobados-para-infraestructura-municipal',
   'Fueron aprobados nuevos recursos para obras de infraestructura en el municipio, entre ellas vialidad, alumbrado y espacios deportivos.\n\nLos trabajos comenzarán durante el próximo trimestre.',
   'Pais3.jpg', 'Prensa Alcaldía', 0, 'publicada', '2026-10-12 09:30:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'eventos'),
   'Gran feria gastronómica y artesanal este próximo sábado',
   'Productores y artesanos de las cuatro parroquias ofrecerán sus productos.',
   'gran-feria-gastronomica-y-artesanal-este-proximo-sabado',
   'Este sábado se realizará una gran feria gastronómica y artesanal con productores de todo el municipio.\n\nHabrá dulces criollos, artesanía, música en vivo y actividades para los niños.',
   'Eventos2.jpg', 'Prensa Alcaldía', 0, 'publicada', '2026-10-11 12:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'eventos'),
   'Jornada médica integral beneficiará a más de 500 familias',
   NULL,
   'jornada-medica-integral-beneficiara-a-mas-de-500-familias',
   'La Alcaldía organiza una jornada médica integral con consultas generales, odontología, pediatría y entrega de medicamentos.\n\nSe espera atender a más de 500 familias del municipio.',
   'Eventos3.jpg', 'Prensa Alcaldía', 0, 'publicada', '2026-10-10 08:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'deportes'),
   'Atletas rangelianos destacan en campeonato regional de atletismo',
   NULL,
   'atletas-rangelianos-destacan-en-campeonato-regional-de-atletismo',
   'Los atletas del municipio obtuvieron varias medallas en el campeonato regional de atletismo.\n\nLa delegación fue recibida por las autoridades municipales a su regreso.',
   'Deportes2.jpg', 'Prensa Alcaldía', 1, 'publicada', '2026-10-18 16:00:00', @sistema),

  ((SELECT id FROM categorias WHERE slug = 'deportes'),
   'Avanza plan de recuperación de canchas comunitarias en Betijoque',
   NULL,
   'avanza-plan-de-recuperacion-de-canchas-comunitarias-en-betijoque',
   'El plan de recuperación de canchas comunitarias avanza en Betijoque con trabajos de pintura, iluminación y reparación de tableros.\n\nLas primeras canchas se entregarán a la comunidad este mes.',
   'Deportes3.jpg', 'Prensa Alcaldía', 0, 'publicada', '2026-10-15 10:00:00', @sistema);

-- Enlace de cada noticia con sus etiquetas (JOIN entre noticias y etiquetas)
INSERT IGNORE INTO noticia_etiqueta (noticia_id, etiqueta_id)
SELECT n.id, e.id
FROM noticias n
INNER JOIN (
  SELECT 'inauguracion-de-la-nueva-galeria-de-arte-municipal' AS noticia, 'cultura' AS etiqueta
  UNION ALL SELECT 'presentacion-de-la-orquesta-sinfonica-infantil-en-la-plaza', 'cultura'
  UNION ALL SELECT 'presentacion-de-la-orquesta-sinfonica-infantil-en-la-plaza', 'eventos'
  UNION ALL SELECT 'nuevas-rutas-guiadas-por-el-casco-historico-de-betijoque', 'turismo'
  UNION ALL SELECT 'posadas-locales-reportan-alta-ocupacion-este-fin-de-semana', 'turismo'
  UNION ALL SELECT 'posadas-locales-reportan-alta-ocupacion-este-fin-de-semana', 'economia'
  UNION ALL SELECT 'acuerdos-internacionales-impulsan-proyectos-de-desarrollo-regional', 'mundial'
  UNION ALL SELECT 'delegacion-local-participa-en-encuentro-cultural-internacional', 'mundial'
  UNION ALL SELECT 'delegacion-local-participa-en-encuentro-cultural-internacional', 'cultura'
  UNION ALL SELECT 'avanza-la-2da-consulta-popular-nacional-en-todo-el-territorio', 'pais'
  UNION ALL SELECT 'nuevos-recursos-aprobados-para-infraestructura-municipal', 'pais'
  UNION ALL SELECT 'nuevos-recursos-aprobados-para-infraestructura-municipal', 'obras'
  UNION ALL SELECT 'gran-feria-gastronomica-y-artesanal-este-proximo-sabado', 'eventos'
  UNION ALL SELECT 'jornada-medica-integral-beneficiara-a-mas-de-500-familias', 'eventos'
  UNION ALL SELECT 'jornada-medica-integral-beneficiara-a-mas-de-500-familias', 'comunidad'
  UNION ALL SELECT 'atletas-rangelianos-destacan-en-campeonato-regional-de-atletismo', 'deportes'
  UNION ALL SELECT 'avanza-plan-de-recuperacion-de-canchas-comunitarias-en-betijoque', 'deportes'
) AS mapa ON mapa.noticia = n.slug
INNER JOIN etiquetas e ON e.slug = mapa.etiqueta;
