import ListadoCategoria from '../portal/ListadoCategoria';

// Las noticias de País salen de la base de datos (ver portal/ListadoCategoria.jsx).
// Aquí solo queda el contenido propio de la barra lateral.
const Pais = () => (
  <ListadoCategoria slug="pais" nombre="País">
    <div className="bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="border-l-4 border-red-700 pl-3 text-lg font-bold text-gray-800 mb-5">Acontecer Nacional</h3>

      <div className="mb-4 rounded overflow-hidden bg-gray-50 flex justify-center">
        <img src="/img/Pais1.jpg" alt="Noticias del País" className="w-full h-auto object-cover rounded border border-gray-200" />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3 text-justify">
        El Municipio Rafael Rangel no es una isla; nuestro crecimiento está estrechamente ligado al desarrollo del estado Trujillo y de toda Venezuela. Aquí agrupamos la información más relevante que ocurre fuera de nuestras fronteras municipales pero que impacta directamente en nuestra cotidianidad.
      </p>

      <p className="text-sm text-gray-700 leading-relaxed text-justify mb-4">
        En esta sección encontrarás un resumen claro del acontecer <strong>Estadal</strong> y <strong>Nacional</strong>: anuncios oficiales, decretos gubernamentales, políticas económicas y planes de infraestructura que marcan el rumbo de nuestra nación.
      </p>
    </div>
  </ListadoCategoria>
);

export default Pais;
