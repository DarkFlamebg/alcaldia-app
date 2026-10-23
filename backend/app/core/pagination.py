import math
from dataclasses import dataclass


@dataclass(frozen=True)
class Paginacion:
    pagina: int
    por_pagina: int
    total: int

    @property
    def paginas(self) -> int:
        return max(1, math.ceil(self.total / self.por_pagina))

    @property
    def offset(self) -> int:
        return (self.pagina - 1) * self.por_pagina

    @property
    def hay_anterior(self) -> bool:
        return self.pagina > 1

    @property
    def hay_siguiente(self) -> bool:
        return self.pagina < self.paginas
