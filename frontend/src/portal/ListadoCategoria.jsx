import { Link, useSearchParams } from 'react-router-dom';
import { useDatos } from './useDatos';
import { fechaCorta } from './formato';

const POR_PAGINA = 6;

const claseNumero = (activa) =>
  `w-10 h-10 flex items-center justify-center font-bold shadow-sm transition-colors cursor-pointer ${
    activa ? 'bg-red-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`;
const claseFlecha =
  'bg-white text-gray-700 hover:bg-gray-100 font-bold px-4 h-10 flex items-center justify-center border border-gray-300 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Página de una categoría de noticias (Cultura, Turismo...). Las noticias salen
 * de la BD; cada página solo define su slug, su nombre y su barra lateral.
 */
export default function ListadoCategoria({ slug, nombre, children }) {
  const [params, setParams] = useSearchParams();
  const pagina = Math.max(1, Number(params.get('pagina')) || 1);
  const { datos, error, cargando } = useDatos(`/noticias?categoria=${slug}&pagina=${pagina}&por_pagina=${POR_PAGINA}`);

  const noticias = datos?.data ?? [];
  const totalPaginas = datos?.meta.paginas ?? 1;
  const paginaActual = datos?.meta.pagina ?? pagina;

  const irA = (p) => {
    setParams(p > 1 ? { pagina: String(p) } : {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-200 min-h-screen pb-16">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 pt-8">

        <div className="text-sm font-medium mb-6 flex items-center gap-2">
          <Link to="/" className="text-red-700 hover:underline">Inicio</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{nombre}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Categoría: {nombre}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {error ? (
              <MensajeVacio texto={error.message} />
            ) : !cargando && noticias.length === 0 ? (
              <MensajeVacio texto={`Todavía no hay noticias publicadas en ${nombre}.`} />
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px] content-start transition-opacity ${cargando && !datos ? 'opacity-50' : ''}`}>
                {noticias.map((noticia) => (
                  <Link key={noticia.id} to={`/noticia/${noticia.id}`}
                    className="bg-white rounded-sm shadow-sm overflow-hidden flex flex-col group cursor-pointer border border-gray-100 animate-fadeIn">
                    <div className="relative overflow-hidden h-48 bg-gray-300">
                      <div className="absolute bottom-2 left-2 flex gap-1 z-10">
                        <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-1 uppercase shadow">{noticia.categoria.nombre}</span>
                      </div>
                      {noticia.imagen_url && (
                        <img src={noticia.imagen_url} alt={noticia.titulo} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-red-700 transition-colors">
                        {noticia.titulo}
                      </h2>
                      <p className="text-xs text-gray-500 font-medium mb-3">{fechaCorta(noticia.publicada_en)} / {noticia.autor}</p>
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{noticia.extracto}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPaginas > 1 && (
              <nav className="flex flex-wrap items-center gap-2 mt-10" aria-label="Paginación">
                <button onClick={() => irA(paginaActual - 1)} disabled={paginaActual === 1} className={claseFlecha}>Anterior</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1)
                  .map((p, i, lista) => (
                    <span key={p} className="flex items-center gap-2">
                      {i > 0 && p - lista[i - 1] > 1 && <span className="text-gray-500 px-1 font-bold">...</span>}
                      <button onClick={() => irA(p)} className={claseNumero(p === paginaActual)}
                        aria-current={p === paginaActual ? 'page' : undefined}>{p}</button>
                    </span>
                  ))}
                <button onClick={() => irA(paginaActual + 1)} disabled={paginaActual === totalPaginas} className={claseFlecha}>Siguiente</button>
              </nav>
            )}
          </div>

          <div className="lg:w-1/3 flex flex-col gap-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MensajeVacio({ texto }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-10 text-center text-gray-600 min-h-[200px] grid place-items-center">
      <p>{texto}</p>
    </div>
  );
}
