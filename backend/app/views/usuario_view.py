class UsuarioView:
    @staticmethod
    def item(u: dict | None) -> dict | None:
        if u is None:
            return None
        return {
            "id": u["id"],
            "nombre": u["nombre"],
            "email": u["email"],
            "rol": u["rol"],
            "permisos": sorted(u.get("permisos", ())),
            "debe_cambiar_clave": bool(u.get("debe_cambiar_clave")),
        }
