import { useParams, Link } from 'react-router-dom';
import { useDatos } from '../portal/useDatos';
import { fechaLarga, parrafos } from '../portal/formato';

// Detalle de una noticia publicada, desde la BD.
const News = () => {
  const { id } = useParams();
  const idValido = /^\d+$/.test(id);
  const { datos, error, cargando } = useDatos(idValido ? `/noticias/${id}` : '/noticias/0');
  const articulo = datos?.data;

  if (!idValido || error) {
    const noExiste = !idValido || error.status === 404;
    return (
      <Contenedor>
        <div className="text-center py-16">
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            {noExiste ? 'Noticia no disponible' : 'No se pudo cargar la noticia'}
          </h1>
          <p className="text-gray-600 mb-8">
            {noExiste ? 'Esta noticia no existe o ya no está publicada.' : error.message}
          </p>
          <Link to="/" className="inline-block bg-red-700 text-white font-bold px-6 py-3 hover:bg-red-800 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </Contenedor>
    );
  }

  if (cargando && !articulo) {
    return (
      <Contenedor>
        <div className="animate-pulse space-y-6" aria-label="Cargando noticia">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-12 bg-gray-200 rounded w-3/4" />
          <div className="h-[400px] bg-gray-200 rounded" />
        </div>
      </Contenedor>
    );
  }

  return (
    <Contenedor>
      <div className="text-xs md:text-sm text-gray-500 mb-8 font-bold uppercase tracking-widest flex items-center gap-2">
        <Link to="/" className="hover:text-red-700 transition-colors">Inicio</Link>
        <span>/</span>
        <Link to={`/${articulo.categoria.slug}`} className="text-red-700 bg-red-50 px-2 py-0.5 rounded hover:bg-red-100 transition-colors">
          {articulo.categoria.nombre}
        </Link>
      </div>

      {/* Título Estilo CNN: Franja roja y letra ultra gruesa */}
      <div className="border-l-[10px] border-red-700 pl-5 mb-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.1]">
          {articulo.titulo}
        </h1>
      </div>

      {articulo.subtitulo && (
        <p className="text-lg md:text-xl font-semibold text-gray-800 leading-snug mb-6 px-1">
          {articulo.subtitulo}
        </p>
      )}

      <p className="text-sm text-gray-500 mb-6 px-1">
        {fechaLarga(articulo.publicada_en)} · <span className="font-semibold text-gray-700">{articulo.autor}</span>
      </p>

      {articulo.imagen_url && (
        <img
          src={articulo.imagen_url}
          alt={articulo.titulo}
          className="w-full h-[400px] md:h-[550px] object-cover rounded mb-10 shadow-sm"
        />
      )}

      <div className="prose prose-lg max-w-none text-gray-900 font-medium leading-relaxed space-y-7 px-1 md:px-4">
        {parrafos(articulo.contenido).map((p, i) => (
          <p key={i} className="text-lg md:text-xl whitespace-pre-line">{p}</p>
        ))}
      </div>

      {articulo.etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200 px-1 md:px-4">
          {articulo.etiquetas.map((etiqueta) => (
            <span key={etiqueta} className="bg-red-700 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
              {etiqueta}
            </span>
          ))}
        </div>
      )}
    </Contenedor>
  );
};

function Contenedor({ children }) {
  return (
    <div className="bg-gray-200 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto bg-white shadow-xl border border-gray-100 rounded-sm overflow-hidden">
        <div className="p-6 md:p-10 lg:p-12">{children}</div>
      </div>
    </div>
  );
}

export default News;
