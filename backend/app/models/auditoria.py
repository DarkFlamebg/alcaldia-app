"""Bitácora de cambios: quién hizo qué, sobre qué registro y cuándo."""

import json
from typing import Any

from fastapi import Request
from sqlalchemy.engine import Connection

from app.core.model import Model


def _a_json(datos: dict | None) -> str | None:
    if datos is None:
        return None
    limpio = {k: v for k, v in datos.items() if k != "password_hash"}
    return json.dumps(limpio, ensure_ascii=False, default=str)


class Auditoria(Model):
    table = "auditoria"
    fillable = ("usuario_id", "accion", "tabla", "registro_id", "datos_anteriores",
                "datos_nuevos", "ip", "user_agent")

    @classmethod
    def registrar(
        cls,
        request: Request,
        accion: str,
        tabla: str,
        registro_id: int | None = None,
        anteriores: dict[str, Any] | None = None,
        nuevos: dict[str, Any] | None = None,
        usuario_id: int | None = None,
        conn: Connection | None = None,
    ) -> None:
        if usuario_id is None:
            usuario = getattr(request.state, "usuario", None)
            usuario_id = usuario["id"] if usuario else None
        cls.create({
            "usuario_id": usuario_id,
            "accion": accion,
            "tabla": tabla,
            "registro_id": registro_id,
            "datos_anteriores": _a_json(anteriores),
            "datos_nuevos": _a_json(nuevos),
            "ip": ip_de(request),
            "user_agent": (request.headers.get("user-agent") or "")[:255] or None,
        }, conn)


def ip_de(request: Request) -> str | None:
    return request.client.host[:45] if request.client else None
