-- =====================================================================
-- Esquema de la base de datos
-- Portal de la Alcaldía del Municipio Rafael Rangel
--
--
-- Uso en MySQL Workbench: abrir este archivo y ejecutarlo completo.
-- Después ejecutar seed.sql.
-- Uso por consola: python -m scripts.init_db (hace los dos pasos).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS alcaldia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alcaldia_db;

-- ---------------------------------------------------------------------
-- Usuarios, roles y permisos
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
  id          INT NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50) NOT NULL COMMENT 'administrador, editor, periodista',
  descripcion VARCHAR(200) NULL,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permisos (
  id          INT NOT NULL AUTO_INCREMENT,
  codigo      VARCHAR(80) NOT NULL COMMENT 'Ej: noticias.crear, eventos.eliminar',
  modulo      VARCHAR(50) NOT NULL,
  descripcion VARCHAR(200) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permisos_codigo (codigo),
  KEY ix_permisos_modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id     INT NOT NULL,
  permiso_id INT NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  CONSTRAINT fk_rol_permiso_rol     FOREIGN KEY (rol_id)     REFERENCES roles (id)    ON DELETE CASCADE,
  CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (permiso_id) REFERENCES permisos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id                 INT NOT NULL AUTO_INCREMENT,
  rol_id             INT NOT NULL,
  nombre             VARCHAR(100) NOT NULL,
  email              VARCHAR(150) NOT NULL,
  password_hash      VARCHAR(255) NOT NULL,
  activo             BOOLEAN NOT NULL DEFAULT TRUE,
  debe_cambiar_clave BOOLEAN NOT NULL DEFAULT FALSE,
  intentos_fallidos  INT NOT NULL DEFAULT 0,
  bloqueado_hasta    DATETIME NULL,
  ultimo_acceso      DATETIME NULL,
  creado_en          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en       DATETIME NULL COMMENT 'Borrado lógico',
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cada intento de login, exitoso o no
CREATE TABLE IF NOT EXISTS registro_accesos (
  id              BIGINT NOT NULL AUTO_INCREMENT,
  usuario_id      INT NULL COMMENT 'NULL si el email no existe',
  email_intentado VARCHAR(150) NOT NULL,
  exitoso         BOOLEAN NOT NULL,
  ip              VARCHAR(45) NULL,
  user_agent      VARCHAR(255) NULL,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_accesos_usuario (usuario_id, creado_en),
  KEY ix_accesos_email (email_intentado, creado_en),
  KEY ix_accesos_ip (ip, creado_en),
  CONSTRAINT fk_accesos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quién cambió qué y cuándo
CREATE TABLE IF NOT EXISTS auditoria (
  id               BIGINT NOT NULL AUTO_INCREMENT,
  usuario_id       INT NULL COMMENT 'Quién hizo la acción',
  accion           ENUM('crear', 'editar', 'eliminar', 'publicar', 'despublicar', 'archivar',
                        'login', 'logout', 'login_fallido', 'cambio_rol', 'cambio_clave') NOT NULL,
  tabla            VARCHAR(60) NOT NULL,
  registro_id      INT NULL,
  datos_anteriores JSON NULL COMMENT 'Estado antes del cambio',
  datos_nuevos     JSON NULL COMMENT 'Estado después del cambio',
  ip               VARCHAR(45) NULL,
  user_agent       VARCHAR(255) NULL,
  creado_en        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_auditoria_registro (tabla, registro_id),
  KEY ix_auditoria_usuario (usuario_id, creado_en),
  KEY ix_auditoria_fecha (creado_en),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Configuración general del sitio y menú
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS configuracion_sitio (
  clave           VARCHAR(60) NOT NULL COMMENT 'nombre_sitio, logo, telefono, correo, facebook...',
  valor           TEXT NULL,
  descripcion     VARCHAR(200) NULL,
  actualizado_por INT NULL,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (clave),
  CONSTRAINT fk_config_usuario FOREIGN KEY (actualizado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
  id        INT NOT NULL AUTO_INCREMENT,
  parent_id INT NULL,
  etiqueta  VARCHAR(60) NOT NULL,
  ruta      VARCHAR(120) NOT NULL,
  orden     INT NOT NULL DEFAULT 0,
  activo    BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_menu_ruta (ruta),
  KEY ix_menu_orden (parent_id, orden),
  CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES menu_items (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Noticias
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categorias (
  id     INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(60) NOT NULL,
  slug   VARCHAR(80) NOT NULL,
  orden  INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_nombre (nombre),
  UNIQUE KEY uq_categorias_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Etiquetas compartidas por noticias y eventos
CREATE TABLE IF NOT EXISTS etiquetas (
  id     INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  slug   VARCHAR(60) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_etiquetas_nombre (nombre),
  UNIQUE KEY uq_etiquetas_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS noticias (
  id              INT NOT NULL AUTO_INCREMENT,
  categoria_id    INT NOT NULL,
  titulo          VARCHAR(200) NOT NULL,
  subtitulo       VARCHAR(300) NULL,
  slug            VARCHAR(220) NOT NULL,
  contenido       LONGTEXT NOT NULL,
  imagen          VARCHAR(255) NULL COMMENT 'Imagen principal (portada). Las adicionales van en noticia_imagenes',
  autor           VARCHAR(120) NOT NULL,
  destacada       BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Alimenta el ticker de Titulares',
  estado          ENUM('borrador', 'publicada', 'archivada') NOT NULL DEFAULT 'borrador',
  publicada_en    DATETIME NULL,
  creado_por      INT NOT NULL,
  actualizado_por INT NULL,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en    DATETIME NULL COMMENT 'Borrado lógico',
  PRIMARY KEY (id),
  UNIQUE KEY uq_noticias_slug (slug),
  KEY ix_noticias_estado (estado, publicada_en),
  KEY ix_noticias_categoria (categoria_id, estado),
  CONSTRAINT fk_noticias_categoria  FOREIGN KEY (categoria_id)    REFERENCES categorias (id),
  CONSTRAINT fk_noticias_creador    FOREIGN KEY (creado_por)      REFERENCES usuarios (id),
  CONSTRAINT fk_noticias_editor     FOREIGN KEY (actualizado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS noticia_etiqueta (
  noticia_id  INT NOT NULL,
  etiqueta_id INT NOT NULL,
  PRIMARY KEY (noticia_id, etiqueta_id),
  KEY ix_noticia_etiqueta_etiqueta (etiqueta_id),
  CONSTRAINT fk_ne_noticia  FOREIGN KEY (noticia_id)  REFERENCES noticias (id)  ON DELETE CASCADE,
  CONSTRAINT fk_ne_etiqueta FOREIGN KEY (etiqueta_id) REFERENCES etiquetas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Imágenes adicionales de una noticia (galería dentro de la noticia).
-- La portada sigue en noticias.imagen; aquí van de 0 a 5 imágenes más
-- (máximo 6 en total). El límite lo controla el backend.
-- Se muestran ordenadas por `orden` ASC (y por `id` si hay empate).
CREATE TABLE IF NOT EXISTS noticia_imagenes (
  id          INT NOT NULL AUTO_INCREMENT,
  noticia_id  INT NOT NULL,
  archivo     VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo guardado en el servidor',
  descripcion VARCHAR(300) NULL COMMENT 'Pie de foto / texto alternativo',
  orden       INT NOT NULL DEFAULT 0 COMMENT '1, 2, 3... posición dentro de la noticia',
  subido_por  INT NOT NULL,
  creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_noticia_imagenes_archivo (noticia_id, archivo),
  KEY ix_noticia_imagenes_orden (noticia_id, orden),
  CONSTRAINT fk_ni_noticia FOREIGN KEY (noticia_id) REFERENCES noticias (id) ON DELETE CASCADE,
  CONSTRAINT fk_ni_usuario FOREIGN KEY (subido_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Eventos
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS eventos (
  id              INT NOT NULL AUTO_INCREMENT,
  titulo          VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) NOT NULL,
  descripcion     LONGTEXT NOT NULL,
  lugar           VARCHAR(200) NULL,
  fecha_inicio    DATETIME NOT NULL,
  fecha_fin       DATETIME NULL,
  imagen          VARCHAR(255) NULL,
  estado          ENUM('borrador', 'publicada', 'archivada') NOT NULL DEFAULT 'borrador',
  creado_por      INT NOT NULL,
  actualizado_por INT NULL,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en    DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_eventos_slug (slug),
  KEY ix_eventos_estado (estado, fecha_inicio),
  CONSTRAINT fk_eventos_creador FOREIGN KEY (creado_por)      REFERENCES usuarios (id),
  CONSTRAINT fk_eventos_editor  FOREIGN KEY (actualizado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS evento_etiqueta (
  evento_id   INT NOT NULL,
  etiqueta_id INT NOT NULL,
  PRIMARY KEY (evento_id, etiqueta_id),
  KEY ix_evento_etiqueta_etiqueta (etiqueta_id),
  CONSTRAINT fk_ee_evento   FOREIGN KEY (evento_id)   REFERENCES eventos (id)   ON DELETE CASCADE,
  CONSTRAINT fk_ee_etiqueta FOREIGN KEY (etiqueta_id) REFERENCES etiquetas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Institucional
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS secciones_institucionales (
  id              INT NOT NULL AUTO_INCREMENT,
  clave           VARCHAR(60) NOT NULL COMMENT 'mision, vision, historia, alcalde, contacto, simbolos',
  titulo          VARCHAR(150) NOT NULL,
  contenido       LONGTEXT NOT NULL,
  imagen          VARCHAR(255) NULL,
  orden           INT NOT NULL DEFAULT 0,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  actualizado_por INT NULL,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_secciones_clave (clave),
  CONSTRAINT fk_secciones_usuario FOREIGN KEY (actualizado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Galería
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS albumes (
  id           INT NOT NULL AUTO_INCREMENT,
  titulo       VARCHAR(150) NOT NULL,
  slug         VARCHAR(170) NOT NULL,
  descripcion  TEXT NULL,
  portada      VARCHAR(255) NULL,
  estado       ENUM('borrador', 'publicada', 'archivada') NOT NULL DEFAULT 'borrador',
  creado_por   INT NOT NULL,
  creado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_albumes_slug (slug),
  CONSTRAINT fk_albumes_creador FOREIGN KEY (creado_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS multimedia (
  id          INT NOT NULL AUTO_INCREMENT,
  album_id    INT NOT NULL,
  tipo        ENUM('imagen', 'video') NOT NULL DEFAULT 'imagen',
  url         VARCHAR(255) NOT NULL,
  titulo      VARCHAR(150) NULL,
  descripcion VARCHAR(300) NULL,
  orden       INT NOT NULL DEFAULT 0,
  subido_por  INT NOT NULL,
  creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_multimedia_album (album_id, orden),
  CONSTRAINT fk_multimedia_album   FOREIGN KEY (album_id)   REFERENCES albumes (id) ON DELETE CASCADE,
  CONSTRAINT fk_multimedia_usuario FOREIGN KEY (subido_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Vista: noticias visibles en el portal, con su categoría (JOIN)
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW v_noticias_publicadas AS
SELECT n.id, n.titulo, n.subtitulo, n.slug, n.imagen, n.autor, n.destacada, n.publicada_en,
       c.id AS categoria_id, c.nombre AS categoria, c.slug AS categoria_slug
FROM noticias n
INNER JOIN categorias c ON c.id = n.categoria_id
WHERE n.estado = 'publicada'
  AND n.eliminado_en IS NULL
  AND c.activo = TRUE;
