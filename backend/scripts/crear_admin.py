"""Crea un usuario del panel (o cambia su contraseña si el email ya existe).

Uso (desde la carpeta backend/):
    python -m scripts.crear_admin
    python -m scripts.crear_admin --nombre "Ana Pérez" --email ana@alcaldia.gob.ve --rol editor

Roles: administrador (por defecto), editor, periodista.
"""

import argparse
import getpass
import re
import sys

from app.core.database import Database
from app.core.security import PasswordHasher
from app.models.rol import Rol
from app.models.usuario import Usuario

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def pedir_password() -> str:
    while True:
        password = getpass.getpass("Contraseña (mínimo 8 caracteres): ")
        if len(password) < 8:
            print("  Muy corta.")
            continue
        if len(password.encode("utf-8")) > PasswordHasher.MAX_BYTES:
            print("  Muy larga (máximo 72 bytes).")
            continue
        if getpass.getpass("Repite la contraseña: ") != password:
            print("  No coinciden.")
            continue
        return password


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--nombre")
    parser.add_argument("--email")
    parser.add_argument("--rol", default="administrador", help="administrador, editor o periodista")
    args = parser.parse_args()

    nombre = (args.nombre or input("Nombre: ")).strip()
    email = (args.email or input("Correo: ")).strip().lower()
    if not nombre or not EMAIL_RE.match(email) or len(nombre) > 100 or len(email) > 150:
        print("Nombre o correo no válidos.")
        return 1
    if email == Usuario.EMAIL_SISTEMA:
        print("Ese correo está reservado para el usuario interno del sistema.")
        return 1
    rol_id = Rol.id_por_nombre(args.rol)
    if rol_id is None:
        print(f"El rol '{args.rol}' no existe. Roles disponibles: {', '.join(Rol.nombres())}")
        return 1

    password_hash = PasswordHasher.hash(pedir_password())
    datos = {
        "nombre": nombre, "password_hash": password_hash, "rol_id": rol_id, "activo": 1,
        "debe_cambiar_clave": 0, "intentos_fallidos": 0, "bloqueado_hasta": None, "eliminado_en": None,
    }
    # Se busca también entre los eliminados (borrado lógico): el correo es único.
    existente = Database.fetch_one("SELECT id FROM usuarios WHERE email = :email", {"email": email})
    if existente:
        Usuario.update(existente["id"], datos)
        print(f"Usuario actualizado: {email} ({args.rol})")
    else:
        Usuario.create({**datos, "email": email})
        print(f"Usuario creado: {email} ({args.rol})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
