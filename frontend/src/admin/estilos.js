// Clases de Tailwind y utilidades compartidas por las pantallas del panel.

export const claseInput =
  'w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-700';

export const boton = {
  primario: 'inline-flex items-center justify-center gap-1 bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-md cursor-pointer disabled:opacity-60',
  secundario: 'inline-flex items-center justify-center gap-1 bg-white border border-gray-300 hover:border-gray-500 text-gray-800 font-semibold px-4 py-2 rounded-md cursor-pointer disabled:opacity-60',
  chico: 'inline-flex items-center justify-center px-2.5 py-1 text-sm font-semibold rounded-md border cursor-pointer disabled:opacity-60',
};

export function formatoFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
