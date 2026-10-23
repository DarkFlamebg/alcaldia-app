import { Link } from 'react-router-dom';
import ListadoCategoria from '../portal/ListadoCategoria';

// Las noticias de Cultura salen de la base de datos (ver portal/ListadoCategoria.jsx).
// Aquí solo queda el contenido propio de la barra lateral.
const Cultura = () => (
  <ListadoCategoria slug="cultura" nombre="Cultura">
    <div className="bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="border-l-4 border-red-700 pl-3 text-lg font-bold text-gray-800 mb-5">Nuestra Historia</h3>
      <div className="mb-4 rounded overflow-hidden bg-gray-50 p-2 flex justify-center">
        <img src="/img/EscudoMunicipio1.jpg" alt="Escudo del Municipio Rafael Rangel" className="w-24 h-auto object-contain opacity-90" />
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-3 text-justify">
        El <strong>Municipio Rafael Rangel</strong>, originado con el histórico asentamiento de Betijoque hacia 1773, es un pilar fundamental del estado Trujillo. Fue elevado a la categoría de cantón en 1843 y rebautizado en 1977 para honrar a su hijo más ilustre, el investigador <strong>Rafael Rangel</strong>, padre de la parasitología en Venezuela.
      </p>
      <p className="text-sm text-gray-700 leading-relaxed text-justify mb-4">
        Conformado por las parroquias Betijoque, Los Cedros, La Pueblita y la parroquia <strong>José Gregorio Hernández</strong> (cuya capital es la población de <strong>Isnotú</strong>, cuna del Venerable Médico), el municipio es un epicentro de tradiciones, fe devocional y desarrollo cultural andino.
      </p>
      <Link to="/institucional" className="text-red-700 text-sm font-bold hover:underline flex items-center gap-1 mt-2">
        Leer historia completa <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </Link>
    </div>
  </ListadoCategoria>
);

export default Cultura;
