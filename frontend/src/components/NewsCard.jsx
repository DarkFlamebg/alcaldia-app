import { Link } from 'react-router-dom';
import { fechaCorta } from '../portal/formato';

// Tarjeta de noticia de la portada. `data` es una noticia de la API pública.
const NewsCard = ({ data }) => {
  if (!data) return null;

  return (
    <Link to={`/noticia/${data.id}`} className="block relative w-full h-80 rounded-lg overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 bg-gray-300">
      {data.imagen_url && (
        <img
          src={data.imagen_url}
          alt={data.titulo}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

      <div className="absolute bottom-5 left-5 right-5 text-white z-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {data.etiquetas.map((etiqueta) => (
            <span key={etiqueta} className="bg-red-700 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
              {etiqueta}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-bold leading-snug group-hover:text-red-300 transition-colors duration-200">
          {data.titulo}
        </h3>

        <p className="text-xs text-gray-300 mt-2 font-light">
          {fechaCorta(data.publicada_en)} / {data.autor}
        </p>
      </div>
    </Link>
  );
};

export default NewsCard;
