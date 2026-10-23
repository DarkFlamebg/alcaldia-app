"""Acceso a la base de datos.

Todas las consultas pasan por esta clase y usan parámetros enlazados
(`:nombre`), nunca concatenación de valores. Es el equivalente a las
sentencias preparadas de PDO en PHP.
"""

from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection, Engine

from app.config import config


@dataclass(frozen=True)
class ResultadoEjecucion:
    lastrowid: int | None
    rowcount: int


class Database:
    _engine: Engine | None = None

    @classmethod
    def engine(cls) -> Engine:
        if cls._engine is None:
            cls._engine = create_engine(config.database_url(), pool_pre_ping=True, pool_recycle=3600)
        return cls._engine

    @classmethod
    @contextmanager
    def transaction(cls) -> Iterator[Connection]:
        """Abre una transacción: se confirma al salir o se revierte si hay un error."""
        with cls.engine().begin() as conn:
            yield conn

    @classmethod
    def fetch_all(cls, sql: str, params: dict[str, Any] | None = None, conn: Connection | None = None) -> list[dict]:
        if conn is None:
            with cls.engine().connect() as c:
                return cls.fetch_all(sql, params, c)
        return [dict(fila) for fila in conn.execute(text(sql), params or {}).mappings()]

    @classmethod
    def fetch_one(cls, sql: str, params: dict[str, Any] | None = None, conn: Connection | None = None) -> dict | None:
        if conn is None:
            with cls.engine().connect() as c:
                return cls.fetch_one(sql, params, c)
        fila = conn.execute(text(sql), params or {}).mappings().first()
        return dict(fila) if fila else None

    @classmethod
    def execute(cls, sql: str, params: dict[str, Any] | None = None, conn: Connection | None = None) -> ResultadoEjecucion:
        if conn is None:
            with cls.transaction() as c:
                return cls.execute(sql, params, c)
        resultado = conn.execute(text(sql), params or {})
        return ResultadoEjecucion(resultado.lastrowid, resultado.rowcount)
