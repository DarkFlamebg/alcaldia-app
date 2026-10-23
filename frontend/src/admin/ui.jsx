// Componentes compartidos por las pantallas del panel.

export function Campo({ etiqueta, error, ayuda, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-1">{etiqueta}</span>
      {children}
      {ayuda && <small className="block text-xs text-gray-500 mt-1">{ayuda}</small>}
      {error && <p className="text-sm text-red-700 mt-1">{error}</p>}
    </label>
  );
}

export function Aviso({ aviso, onCerrar }) {
  if (!aviso) return null;
  const estilos = aviso.tipo === 'error'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-green-50 border-green-200 text-green-800';
  return (
    <div role="status" className={`mb-4 border rounded-md px-4 py-3 flex justify-between gap-4 ${estilos}`}>
      <span>{aviso.texto}</span>
      {onCerrar && <button onClick={onCerrar} className="font-bold cursor-pointer" aria-label="Cerrar">×</button>}
    </div>
  );
}
