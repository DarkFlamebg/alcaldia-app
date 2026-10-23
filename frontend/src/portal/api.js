// Cliente de la API pública del portal (/api/portal). Solo lectura, sin sesión.

export class ErrorPortal extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export async function obtener(ruta) {
  let respuesta;
  try {
    respuesta = await fetch(`/api/portal${ruta}`, { cache: 'no-store' });
  } catch {
    throw new ErrorPortal(0, 'No se pudo conectar con el servidor.');
  }
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorPortal(respuesta.status, datos?.detail ?? 'No se pudo cargar la información.');
  }
  return datos;
}
