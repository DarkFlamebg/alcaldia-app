// Cliente de la API del backend.
// - Envía la cookie de sesión en cada petición.
// - Añade el header X-CSRF-Token a toda petición que modifica datos.

let csrfToken = null;
let alExpirarSesion = () => {};

export class ApiError extends Error {
  constructor(status, data) {
    const detalle = typeof data?.detail === 'string' ? data.detail : 'Los datos enviados no son válidos.';
    super(detalle);
    this.status = status;
    this.errores = data?.errores ?? {};
  }
}

// AuthProvider registra aquí qué hacer cuando la sesión vence (respuesta 401).
export function onSesionExpirada(callback) {
  alExpirarSesion = callback;
}

async function obtenerCsrf() {
  if (!csrfToken) {
    const respuesta = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
    csrfToken = (await respuesta.json()).csrf_token;
  }
  return csrfToken;
}

/**
 * api('/admin/noticias')                                  GET
 * api('/auth/login', { method: 'POST', body: {...} })     JSON
 * api('/admin/noticias', { method: 'POST', form })        FormData (con imagen)
 */
export async function api(ruta, { method = 'GET', body, form } = {}) {
  const headers = { Accept: 'application/json' };
  if (method !== 'GET') headers['X-CSRF-Token'] = await obtenerCsrf();

  let payload;
  if (form) {
    payload = form; // el navegador pone el Content-Type multipart
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const respuesta = await fetch(`/api${ruta}`, { method, headers, body: payload, credentials: 'same-origin' });
  const data = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);

  if (data?.csrf_token) csrfToken = data.csrf_token;

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !ruta.startsWith('/auth/')) alExpirarSesion();
    if (respuesta.status === 403 && data?.detail?.includes?.('CSRF')) csrfToken = null;
    throw new ApiError(respuesta.status, data);
  }
  return data;
}
