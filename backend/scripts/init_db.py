"""Crea la base de datos, sus tablas y los datos iniciales.

Uso (desde la carpeta backend/):
    python -m scripts.init_db              # crea lo que falte, no borra nada
    python -m scripts.init_db --sin-datos  # solo tablas, sin noticias de ejemplo
    python -m scripts.init_db --reset      # BORRA la base y la crea de nuevo
"""

import argparse
import re
import shutil
import sys

from sqlalchemy import create_engine, text

from app.config import BASE_DIR, config

DATABASE_DIR = BASE_DIR / "database"
IMAGENES_SEMILLA = DATABASE_DIR / "semillas" / "img"


def dividir_sentencias(sql: str) -> list[str]:
    """Separa un archivo SQL en sentencias por ';', ignorando los ';' dentro de
    textos entre comillas y los comentarios '-- '."""
    sentencias: list[str] = []
    actual: list[str] = []
    comilla: str | None = None
    i = 0
    while i < len(sql):
        ch = sql[i]
        if comilla:
            actual.append(ch)
            if ch == "\\" and i + 1 < len(sql):
                actual.append(sql[i + 1])
                i += 2
                continue
            if ch == comilla:
                comilla = None
        elif ch in ("'", '"', "`"):
            comilla = ch
            actual.append(ch)
        elif sql.startswith("--", i) and (i + 2 >= len(sql) or sql[i + 2] in " \t\r\n"):
            salto = sql.find("\n", i)
            i = len(sql) if salto == -1 else salto
            continue
        elif ch == ";":
            sentencia = "".join(actual).strip()
            if sentencia:
                sentencias.append(sentencia)
            actual = []
        else:
            actual.append(ch)
        i += 1
    resto = "".join(actual).strip()
    if resto:
        sentencias.append(resto)
    return sentencias


def ejecutar_archivo(engine, nombre: str) -> None:
    sentencias = dividir_sentencias((DATABASE_DIR / nombre).read_text(encoding="utf-8"))
    # Los archivos traen CREATE DATABASE / USE para poder ejecutarlos en Workbench.
    # Aquí se omiten: la base ya se creó con el nombre de DB_NAME y la conexión ya la usa.
    sentencias = [s for s in sentencias if not re.match(r"(CREATE\s+DATABASE|USE)\s", s, re.IGNORECASE)]
    # Se usa la conexión del driver sin parámetros para que textos con '%' o ':'
    # se envíen tal cual.
    conn = engine.raw_connection()
    try:
        with conn.cursor() as cursor:
            for sentencia in sentencias:
                cursor.execute(sentencia)
        conn.commit()
    finally:
        conn.close()
    print(f"  ✓ {nombre} ({len(sentencias)} sentencias)")


def copiar_imagenes_semilla() -> None:
    """Copia a la carpeta de subidas las imágenes que usan las noticias de ejemplo."""
    nombres = re.findall(r"'([\w-]+\.jpg)'", (DATABASE_DIR / "seed.sql").read_text(encoding="utf-8"))
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    copiadas = 0
    for nombre in sorted(set(nombres)):
        origen = IMAGENES_SEMILLA / nombre
        destino = config.UPLOAD_DIR / nombre
        if origen.exists() and not destino.exists():
            shutil.copy2(origen, destino)
            copiadas += 1
        elif not origen.exists():
            print(f"  ! No se encontró {origen}")
    print(f"  ✓ imágenes de ejemplo copiadas: {copiadas}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reset", action="store_true", help="borra la base de datos completa antes de crearla")
    parser.add_argument("--sin-datos", action="store_true", help="no cargar los datos de ejemplo")
    args = parser.parse_args()

    if not re.fullmatch(r"[A-Za-z0-9_]+", config.DB_NAME):
        print("DB_NAME solo puede tener letras, números y guion bajo.")
        return 1

    servidor = create_engine(config.database_url(con_base=False))
    with servidor.begin() as conn:
        if args.reset:
            print(f"Borrando la base de datos '{config.DB_NAME}'...")
            conn.execute(text(f"DROP DATABASE IF EXISTS `{config.DB_NAME}`"))
        conn.execute(text(
            f"CREATE DATABASE IF NOT EXISTS `{config.DB_NAME}` "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        ))
    servidor.dispose()
    print(f"Base de datos '{config.DB_NAME}' lista.")

    engine = create_engine(config.database_url())
    ejecutar_archivo(engine, "schema.sql")
    if not args.sin_datos:
        ejecutar_archivo(engine, "seed.sql")
        copiar_imagenes_semilla()
    engine.dispose()

    if config.DB_NAME != "alcaldia_db":
        print(f"  (Aviso: schema.sql y seed.sql usan 'alcaldia_db' al abrirlos en Workbench; aquí se usó '{config.DB_NAME}'.)")
    print("\nListo. Crea el usuario administrador con:  python -m scripts.crear_admin")
    return 0


if __name__ == "__main__":
    sys.exit(main())
