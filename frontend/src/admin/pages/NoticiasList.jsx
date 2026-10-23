import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { puede, useAuth } from '../auth';
import { boton, claseInput, formatoFecha } from '../estilos';
import { Aviso } from '../ui';

const NOMBRE_ESTADO = { publicada: 'Publicada', borrador: 'Borrador', archivada: 'Archivada' };
const ESTILO_ESTADO = {
  publicada: 'bg-green-50 text-green-700',
  borrador: 'bg-amber-50 text-amber-700',
  archivada: 'bg-gray-100 text-gray-600',
};

export default function NoticiasList() {
  const { usuario } = useAuth();
  const puedePublicar = puede(usuario, 'noticias.publicar');
  const puedeEliminar = puede(usuario, 'noticias.eliminar');
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [categorias, setCategorias] = useState([]);
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState({ clave: null, data: [], meta: null, error: '' });
  const [aviso, setAviso] = useState(location.state?.mensaje ? { tipo: 'exito', texto: location.state.mensaje } : null);
  const [busqueda, setBusqueda] = useState(params.get('q') ?? '');
  const [confirmarId, setConfirmarId] = useState(null);
  const [ocupadoId, setOcupadoId] = useState(null);

  const consulta = params.toString();
  const claveActual = `${consulta}#${version}`;
  const cargando = resultado.clave !== claveActual;

  // El mensaje que llega al volver del formulario se muestra una sola vez.
  useEffect(() => {
    if (location.state?.mensaje) navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    api('/admin/categorias').then((d) => setCategorias(d.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let vigente = true;
    const clave = `${consulta}#${version}`;
    api(`/admin/noticias?${consulta}`)
      .then((d) => vigente && setResultado({ clave, data: d.data, meta: d.meta, error: '' }))
      .catch((err) => vigente && setResultado({ clave, data: [], meta: null, error: err.message }));
    return () => { vigente = false; };
  }, [consulta, version]);

  const filtrar = (cambios) => {
    const nuevos = Object.fromEntries(params);
    Object.assign(nuevos, cambios);
    delete nuevos.pagina;
    if (cambios.pagina) nuevos.pagina = cambios.pagina;
    setParams(Object.fromEntries(Object.entries(nuevos).filter(([, v]) => v)));
  };

  const accion = async (noticia, peticion, mensaje) => {
    setOcupadoId(noticia.id);
    try {
      await peticion();
      setAviso({ tipo: 'exito', texto: mensaje });
      setVersion((v) => v + 1);
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setOcupadoId(null);
      setConfirmarId(null);
    }
  };

  const cambiarEstado = (n) => {
    const estado = n.estado === 'publicada' ? 'borrador' : 'publicada';
    accion(n, () => api(`/admin/noticias/${n.id}/estado`, { method: 'PATCH', body: { estado } }),
      estado === 'publicada' ? 'Noticia publicada.' : 'Noticia pasada a borrador.');
  };

  const eliminar = (n) =>
    accion(n, () => api(`/admin/noticias/${n.id}`, { method: 'DELETE' }), 'Noticia eliminada.');

  const { data: noticias, meta } = resultado;
  const hayFiltros = params.get('q') || params.get('categoria') || params.get('estado');

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Noticias</h1>
          <p className="text-sm text-gray-500">
            {meta ? `${meta.total} noticia${meta.total === 1 ? '' : 's'}` : ' '}
          </p>
        </div>
        <Link to="/admin/noticias/nueva" className={boton.primario}>+ Nueva noticia</Link>
      </div>

      <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />

      <form
        onSubmit={(e) => { e.preventDefault(); filtrar({ q: busqueda.trim() }); }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-end"
      >
        <label className="flex-1 min-w-[220px]">
          <span className="block text-sm font-semibold text-gray-700 mb-1">Buscar</span>
          <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Título o subtítulo" maxLength={100} className={claseInput} />
        </label>
        <label className="min-w-[170px]">
          <span className="block text-sm font-semibold text-gray-700 mb-1">Categoría</span>
          <select value={params.get('categoria') ?? ''} onChange={(e) => filtrar({ categoria: e.target.value })} className={claseInput}>
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.total_noticias})</option>)}
          </select>
        </label>
        <label className="min-w-[150px]">
          <span className="block text-sm font-semibold text-gray-700 mb-1">Estado</span>
          <select value={params.get('estado') ?? ''} onChange={(e) => filtrar({ estado: e.target.value })} className={claseInput}>
            <option value="">Todos</option>
            <option value="publicada">Publicadas</option>
            <option value="borrador">Borradores</option>
            <option value="archivada">Archivadas</option>
          </select>
        </label>
        <button type="submit" className={boton.secundario}>Buscar</button>
        {hayFiltros && (
          <button type="button" className={boton.secundario} onClick={() => { setBusqueda(''); setParams({}); }}>
            Limpiar
          </button>
        )}
      </form>

      {resultado.error && !cargando && <Aviso aviso={{ tipo: 'error', texto: resultado.error }} />}

      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto transition-opacity ${cargando ? 'opacity-60' : ''}`}>
        {noticias.length === 0 && !cargando ? (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-4">No hay noticias{hayFiltros ? ' con esos filtros' : ''}.</p>
            {!hayFiltros && <Link to="/admin/noticias/nueva" className={boton.primario}>Crear la primera</Link>}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 hidden sm:table-cell">Imagen</th>
                <th className="px-4 py-3">Noticia</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {noticias.map((n) => (
                <tr key={n.id} className="align-top hover:bg-gray-50">
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {n.imagen_url
                      ? <img src={n.imagen_url} alt="" loading="lazy" className="w-24 h-16 object-cover rounded" />
                      : <div className="w-24 h-16 rounded bg-gray-100 grid place-items-center text-[10px] text-gray-400">Sin imagen</div>}
                  </td>
                  <td className="px-4 py-3 max-w-md">
                    <Link to={`/admin/noticias/${n.id}/editar`} className="font-bold text-gray-900 hover:text-red-700">
                      {n.titulo}
                    </Link>
                    {n.destacada && (
                      <span title="Aparece en el ticker de titulares"
                        className="ml-2 align-middle bg-red-700 text-white text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">
                        Destacada
                      </span>
                    )}
                    {n.subtitulo && <p className="text-gray-500 mt-0.5 line-clamp-2">{n.subtitulo}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {n.autor} · cargada por {n.creado_por.nombre}
                    </p>
                    {n.etiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {n.etiquetas.map((e) => (
                          <span key={e} className="text-[11px] bg-gray-100 border border-gray-200 text-gray-600 px-1.5 rounded">{e}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{n.categoria.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${ESTILO_ESTADO[n.estado]}`}>
                      {NOMBRE_ESTADO[n.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {n.publicada_en ? formatoFecha(n.publicada_en) : <span className="text-gray-400">Creada {formatoFecha(n.creado_en)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5 whitespace-nowrap">
                      {confirmarId === n.id ? (
                        <>
                          <span className="self-center text-red-700 font-semibold mr-1">¿Eliminar?</span>
                          <button disabled={ocupadoId === n.id} onClick={() => eliminar(n)}
                            className={`${boton.chico} bg-red-700 border-red-700 text-white`}>Sí, eliminar</button>
                          <button onClick={() => setConfirmarId(null)}
                            className={`${boton.chico} border-gray-300 text-gray-700`}>No</button>
                        </>
                      ) : (
                        <>
                          <Link to={`/admin/noticias/${n.id}/editar`} className={`${boton.chico} border-gray-300 text-gray-800 hover:bg-gray-100`}>
                            Editar
                          </Link>
                          {puedePublicar && (
                          <button disabled={ocupadoId === n.id} onClick={() => cambiarEstado(n)}
                            className={`${boton.chico} ${n.estado === 'publicada'
                              ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
                              : 'border-green-700 bg-green-700 text-white hover:bg-green-800'}`}>
                            {n.estado === 'publicada' ? 'Despublicar' : 'Publicar'}
                          </button>
                          )}
                          {puedeEliminar && (
                            <button onClick={() => setConfirmarId(n.id)}
                              className={`${boton.chico} border-red-200 text-red-700 hover:bg-red-50`}>Eliminar</button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.paginas > 1 && (
        <nav className="flex justify-center items-center gap-4 mt-5 text-sm text-gray-600" aria-label="Paginación">
          <button disabled={meta.pagina <= 1} onClick={() => filtrar({ pagina: String(meta.pagina - 1) })}
            className={`${boton.chico} border-gray-300 bg-white`}>← Anterior</button>
          <span>Página {meta.pagina} de {meta.paginas}</span>
          <button disabled={meta.pagina >= meta.paginas} onClick={() => filtrar({ pagina: String(meta.pagina + 1) })}
            className={`${boton.chico} border-gray-300 bg-white`}>Siguiente →</button>
        </nav>
      )}
    </div>
  );
}
