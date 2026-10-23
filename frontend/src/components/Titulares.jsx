import { Link } from 'react-router-dom';
import { useDatos } from '../portal/useDatos';

// Ticker de titulares: noticias destacadas publicadas, desde la BD.
const Titulares = () => {
  const { datos } = useDatos('/destacadas?limite=10');
  const titularesNoticias = datos?.data ?? [];

  return (
    <div className="bg-white border-b border-gray-200 flex items-center h-10 overflow-hidden relative z-20 shadow-sm">
      <div 
        className="bg-gray-300 text-gray-900 font-bold pl-6 pr-10 h-full flex items-center z-10 whitespace-nowrap relative shrink-0"
        style={{ clipPath: 'polygon(0 0, 82% 0, 100% 100%, 0 100%)' }}
      >
        <span className="relative flex h-3 w-3 mr-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-700"></span>
        </span>
        <span className="tracking-wide text-xs uppercase font-extrabold text-gray-800">
          Titulares
        </span>
      </div>
      
      <div className="flex-1 overflow-hidden bg-white py-1">
        {/* Ajuste de accesibilidad: text-gray-900 y font-bold */}
        {titularesNoticias.length === 0 ? (
          <p className="px-6 py-1 text-sm text-gray-500">No hay titulares por ahora.</p>
        ) : (
        <marquee id="marquee-noticias" className="text-gray-900 font-bold" scrollamount="8">
          {titularesNoticias.map((item) => (
            <span key={item.id} className="mx-6 inline-block py-1">
              <span className="text-gray-400 mr-2">|</span>
              <Link 
                to={`/noticia/${item.id}`} 
                onMouseOver={() => document.getElementById('marquee-noticias')?.stop()} 
                onMouseOut={() => document.getElementById('marquee-noticias')?.start()} 
                className="hover:text-red-700 hover:underline transition-colors duration-200 cursor-pointer text-gray-900 font-bold text-sm sm:text-base tracking-wide"
              >
                {item.titulo}
              </Link>
            </span>
          ))}
        </marquee>
        )}
      </div>
    </div>
  );
};

export default Titulares;