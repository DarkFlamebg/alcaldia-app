// "2026-10-19T09:00:00" -> "19/10/2026"
export function fechaCorta(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// "2026-10-19T09:00:00" -> "19 de octubre de 2026"
export function fechaLarga(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
}

// El contenido se guarda como texto plano: los párrafos van separados por una línea en blanco.
export function parrafos(texto) {
  return (texto ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
