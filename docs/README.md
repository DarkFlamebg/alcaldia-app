# Documentación del proyecto

Esta carpeta guarda el contexto del proyecto: qué se construye, cómo está
armado, en qué fase vamos y qué cambió en cada paso. Se actualiza cada vez que
se termina una parte del trabajo.

| Archivo | Para qué sirve |
| --- | --- |
| [fases.md](fases.md) | Plan completo por fases y estado de cada una |
| [requisitos.md](requisitos.md) | Requisitos del docente y cómo los cumple el proyecto |
| [arquitectura.md](arquitectura.md) | Cómo se divide el sistema (MVC, carpetas, flujo de login) |
| [base-de-datos.md](base-de-datos.md) | Tablas, relaciones, JOINs y diagrama |
| [api.md](api.md) | Endpoints del backend |
| [instalacion.md](instalacion.md) | Cómo instalar y correr todo en local |
| [decisiones.md](decisiones.md) | Decisiones tomadas y preguntas pendientes con el docente |
| [changelog.md](changelog.md) | Registro de cambios, por fecha |

## Resumen rápido

- **Proyecto:** portal de noticias de la Alcaldía del Municipio Rafael Rangel.
- **Frontend (`frontend/`):** React + Vite + Tailwind. Tiene el portal público
  y el panel del administrador (`/admin`).
- **Backend (`backend/`):** API JSON en Python (FastAPI + SQLAlchemy + MySQL),
  organizada en MVC con POO. No tiene páginas HTML: solo responde JSON.
- **Fase actual:** Fase 1 terminada (BD, login y CRUD de noticias con imagen).
