"""Clase base de todos los modelos (la "M" de MVC).

Cada modelo hereda de `Model`, define su tabla y las columnas que se pueden
escribir (`fillable`), y añade sus propias consultas (con JOINs) cuando las
necesita. Los nombres de tabla y columna salen siempre de la clase, nunca de
lo que envía el usuario; los valores van siempre como parámetros.
"""

from typing import Any, ClassVar

from sqlalchemy.engine import Connection

from app.core.database import Database


class Model:
    table: ClassVar[str] = ""
    primary_key: ClassVar[str] = "id"
    fillable: ClassVar[tuple[str, ...]] = ()

    @classmethod
    def _filtrar(cls, datos: dict[str, Any]) -> dict[str, Any]:
        return {k: v for k, v in datos.items() if k in cls.fillable}

    @classmethod
    def find(cls, id_: int, conn: Connection | None = None) -> dict | None:
        sql = f"SELECT * FROM {cls.table} WHERE {cls.primary_key} = :id"
        return Database.fetch_one(sql, {"id": id_}, conn)

    @classmethod
    def create(cls, datos: dict[str, Any], conn: Connection | None = None) -> int:
        datos = cls._filtrar(datos)
        columnas = ", ".join(datos)
        marcadores = ", ".join(f":{c}" for c in datos)
        sql = f"INSERT INTO {cls.table} ({columnas}) VALUES ({marcadores})"
        return int(Database.execute(sql, datos, conn).lastrowid)

    @classmethod
    def update(cls, id_: int, datos: dict[str, Any], conn: Connection | None = None) -> bool:
        datos = cls._filtrar(datos)
        if not datos:
            return False
        asignaciones = ", ".join(f"{c} = :{c}" for c in datos)
        sql = f"UPDATE {cls.table} SET {asignaciones} WHERE {cls.primary_key} = :_id"
        return Database.execute(sql, {**datos, "_id": id_}, conn).rowcount > 0

    @classmethod
    def delete(cls, id_: int, conn: Connection | None = None) -> bool:
        sql = f"DELETE FROM {cls.table} WHERE {cls.primary_key} = :id"
        return Database.execute(sql, {"id": id_}, conn).rowcount > 0

    @classmethod
    def exists(cls, columna: str, valor: Any, excluir_id: int | None = None, conn: Connection | None = None) -> bool:
        if columna not in cls.fillable:
            raise ValueError(f"Columna no permitida: {columna}")
        sql = f"SELECT 1 FROM {cls.table} WHERE {columna} = :valor"
        params: dict[str, Any] = {"valor": valor}
        if excluir_id is not None:
            sql += f" AND {cls.primary_key} <> :excluir"
            params["excluir"] = excluir_id
        return Database.fetch_one(sql + " LIMIT 1", params, conn) is not None
