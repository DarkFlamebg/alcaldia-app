import { Link } from 'react-router-dom';
import ListadoCategoria from '../portal/ListadoCategoria';

// Las noticias de Turismo salen de la base de datos (ver portal/ListadoCategoria.jsx).
// Aquí solo queda el contenido propio de la barra lateral.
const Turismo = () => (
  <ListadoCategoria slug="turismo" nombre="Turismo">
    <div className="bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="border-l-4 border-red-700 pl-3 text-lg font-bold text-gray-800 mb-5">Destinos Turísticos</h3>

      <div className="mb-4 rounded overflow-hidden bg-gray-50 p-2 flex justify-center">
        <img src="/img/Turismo2.jpg" alt="Santuario de Isnotú" className="w-full h-auto object-cover rounded" />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3 text-justify">
        El <strong>Municipio Rafael Rangel</strong> ofrece una experiencia única donde la fe, la historia y la naturaleza se encuentran. Nuestro principal motor turístico es la parroquia José Gregorio Hernández y su capital <strong>Isnotú</strong>, tierra natal del Venerable, cuyo santuario recibe a miles de peregrinos buscando paz y sanación espiritual.
      </p>

      <p className="text-sm text-gray-700 leading-relaxed text-justify mb-4">
        Además de esta profunda ruta de fe, te invitamos a recorrer las calles coloniales de Betijoque, disfrutar de nuestra cálida gastronomía andina, el clima de montaña y descansar en acogedoras posadas que hacen de nuestra tierra un destino inolvidable.
      </p>

      <Link to="/institucional" className="text-red-700 text-sm font-bold hover:underline flex items-center gap-1 mt-2">
        Conoce más rutas turísticas <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </Link>
    </div>
  </ListadoCategoria>
);

export default Turismo;
