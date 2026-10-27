-- =====================================================================
-- Uso en MySQL Workbench:
--   1. Abre este archivo (File > Open SQL Script...)
--   2. Ejecuta TODO el script (Ctrl+Shift+Enter o el rayo ⚡ sin selección)
--   La base de datos se crea automáticamente y se selecciona.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS alcaldia_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE alcaldia_db;

-- ---------------------------------------------------------------------

CREATE TABLE `roles` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(50) UNIQUE NOT NULL COMMENT 'administrador, editor, periodista',
  `descripcion` varchar(200),
  `activo` boolean NOT NULL DEFAULT true
);

CREATE TABLE `permisos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `codigo` varchar(80) UNIQUE NOT NULL COMMENT 'Ej: noticias.crear, eventos.eliminar',
  `modulo` varchar(50) NOT NULL,
  `descripcion` varchar(200)
);

CREATE TABLE `rol_permiso` (
  `rol_id` int NOT NULL,
  `permiso_id` int NOT NULL,
  PRIMARY KEY (`rol_id`, `permiso_id`)
);

CREATE TABLE `usuarios` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `rol_id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` boolean NOT NULL DEFAULT true,
  `debe_cambiar_clave` boolean NOT NULL DEFAULT false,
  `intentos_fallidos` int NOT NULL DEFAULT 0,
  `bloqueado_hasta` datetime,
  `ultimo_acceso` datetime,
  `creado_en` timestamp DEFAULT (now()),
  `actualizado_en` timestamp DEFAULT (now()),
  `eliminado_en` datetime COMMENT 'Borrado lógico'
);

CREATE TABLE `registro_accesos` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` int COMMENT 'NULL si el email no existe',
  `email_intentado` varchar(150) NOT NULL,
  `exitoso` boolean NOT NULL,
  `ip` varchar(45),
  `user_agent` varchar(255),
  `creado_en` timestamp DEFAULT (now())
);

CREATE TABLE `auditoria` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` int COMMENT 'Quién hizo la acción',
  `accion` ENUM ('crear', 'editar', 'eliminar', 'publicar', 'despublicar', 'login', 'logout', 'login_fallido', 'cambio_rol', 'cambio_clave') NOT NULL,
  `tabla` varchar(60) NOT NULL,
  `registro_id` int,
  `datos_anteriores` json COMMENT 'Estado antes del cambio',
  `datos_nuevos` json COMMENT 'Estado después del cambio',
  `ip` varchar(45),
  `user_agent` varchar(255),
  `creado_en` timestamp DEFAULT (now())
);

CREATE TABLE `configuracion_sitio` (
  `clave` varchar(60) PRIMARY KEY COMMENT 'nombre_sitio, logo, escudo, bandera, footer_texto, telefono, correo, facebook...',
  `valor` text,
  `descripcion` varchar(200),
  `actualizado_por` int,
  `actualizado_en` timestamp DEFAULT (now())
);

CREATE TABLE `menu_items` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `parent_id` int,
  `etiqueta` varchar(60) NOT NULL,
  `ruta` varchar(120) NOT NULL,
  `orden` int NOT NULL DEFAULT 0,
  `activo` boolean NOT NULL DEFAULT true
);

CREATE TABLE `etiquetas` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(50) UNIQUE NOT NULL,
  `slug` varchar(60) UNIQUE NOT NULL
);

CREATE TABLE `categorias` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `slug` varchar(80) UNIQUE NOT NULL,
  `orden` int NOT NULL DEFAULT 0,
  `activo` boolean NOT NULL DEFAULT true
);

CREATE TABLE `noticias` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `categoria_id` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `subtitulo` varchar(300),
  `slug` varchar(220) UNIQUE NOT NULL,
  `contenido` longtext NOT NULL,
  `imagen` varchar(255),
  `autor` varchar(120) NOT NULL,
  `destacada` boolean NOT NULL DEFAULT false COMMENT 'Alimenta el ticker de Titulares',
  `estado` ENUM ('borrador', 'publicada', 'archivada') NOT NULL DEFAULT 'borrador',
  `publicada_en` datetime,
  `creado_por` int NOT NULL,
  `actualizado_por` int,
  `creado_en` timestamp DEFAULT (now()),
  `actualizado_en` timestamp DEFAULT (now()),
  `eliminado_en` datetime
);

CREATE TABLE `noticia_etiqueta` (
  `noticia_id` int NOT NULL,
  `etiqueta_id` int NOT NULL,
  PRIMARY KEY (`noticia_id`, `etiqueta_id`)
);

CREATE TABLE `eventos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `slug` varchar(220) UNIQUE NOT NULL,
  `descripcion` longtext NOT NULL,
  `lugar` varchar(200),
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime,
  `imagen` varchar(255),
  `estado` ENUM ('borrador', 'publicada', 'archivada') NOT NULL DEFAULT 'borrador',
  `creado_por` int NOT NULL,
  `actualizado_por` int,
  `creado_en` timestamp DEFAULT (now()),
  `actualizado_en` timestamp DEFAULT (now()),
  `eliminado_en` datetime
);

CREATE TABLE `evento_etiqueta` (
  `evento_id` int NOT NULL,
  `etiqueta_id` int NOT NULL,
  PRIMARY KEY (`evento_id`, `etiqueta_id`)
);

CREATE TABLE `secciones_institucionales` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `clave` varchar(60) UNIQUE NOT NULL COMMENT 'mision, vision, historia, alcalde, contacto, simbolos',
  `titulo` varchar(150) NOT NULL,
  `contenido` longtext NOT NULL,
  `imagen` varchar(255),
  `orden` int NOT NULL DEFAULT 0,
  `activo` boolean NOT NULL DEFAULT true,
  `actualizado_por` int,
  `actualizado_en` timestamp DEFAULT (now())
);

CREATE TABLE `albumes` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `slug` varchar(170) UNIQUE NOT NULL,
  `descripcion` text,
  `portada` varchar(255),
  `estado` ENUM ('borrador', 'publicada', 'archivada') NOT NULL DEFAULT 'borrador',
  `creado_por` int NOT NULL,
  `creado_en` timestamp DEFAULT (now()),
  `eliminado_en` datetime
);

CREATE TABLE `multimedia` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `album_id` int NOT NULL,
  `tipo` ENUM ('imagen', 'video') NOT NULL DEFAULT 'imagen',
  `url` varchar(255) NOT NULL,
  `titulo` varchar(150),
  `descripcion` varchar(300),
  `orden` int NOT NULL DEFAULT 0,
  `subido_por` int NOT NULL,
  `creado_en` timestamp DEFAULT (now())
);

CREATE INDEX `registro_accesos_index_0` ON `registro_accesos` (`usuario_id`, `creado_en`);

CREATE INDEX `registro_accesos_index_1` ON `registro_accesos` (`email_intentado`, `creado_en`);

CREATE INDEX `auditoria_index_2` ON `auditoria` (`tabla`, `registro_id`);

CREATE INDEX `auditoria_index_3` ON `auditoria` (`usuario_id`, `creado_en`);

CREATE INDEX `auditoria_index_4` ON `auditoria` (`creado_en`);

CREATE INDEX `noticias_index_5` ON `noticias` (`estado`, `publicada_en`);

CREATE INDEX `noticias_index_6` ON `noticias` (`categoria_id`, `estado`);

CREATE INDEX `eventos_index_7` ON `eventos` (`estado`, `fecha_inicio`);

ALTER TABLE `usuarios` ADD FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);

ALTER TABLE `rol_permiso` ADD FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

ALTER TABLE `rol_permiso` ADD FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE;

ALTER TABLE `registro_accesos` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

ALTER TABLE `auditoria` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

ALTER TABLE `configuracion_sitio` ADD FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `menu_items` ADD FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`);

ALTER TABLE `noticias` ADD FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

ALTER TABLE `noticias` ADD FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `noticias` ADD FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `noticia_etiqueta` ADD FOREIGN KEY (`noticia_id`) REFERENCES `noticias` (`id`) ON DELETE CASCADE;

ALTER TABLE `noticia_etiqueta` ADD FOREIGN KEY (`etiqueta_id`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE;

ALTER TABLE `eventos` ADD FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `eventos` ADD FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `evento_etiqueta` ADD FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE;

ALTER TABLE `evento_etiqueta` ADD FOREIGN KEY (`etiqueta_id`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE;

ALTER TABLE `secciones_institucionales` ADD FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `albumes` ADD FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `multimedia` ADD FOREIGN KEY (`album_id`) REFERENCES `albumes` (`id`) ON DELETE CASCADE;

ALTER TABLE `multimedia` ADD FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id`);

ALTER TABLE `categorias` ADD FOREIGN KEY (`orden`) REFERENCES `categorias` (`id`);
