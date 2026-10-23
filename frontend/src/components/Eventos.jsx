import ListadoCategoria from '../portal/ListadoCategoria';

// Las noticias de Eventos salen de la base de datos (ver portal/ListadoCategoria.jsx).
// Aquí solo queda el contenido propio de la barra lateral.
const Eventos = () => (
  <ListadoCategoria slug="eventos" nombre="Eventos">
    <div className="bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="border-l-4 border-red-700 pl-3 text-lg font-bold text-gray-800 mb-5">Agenda Municipal</h3>

      <div className="mb-4 rounded overflow-hidden bg-gray-50 flex justify-center">
        <img src="/img/Eventos1.jpg" alt="Agenda de Eventos" className="w-full h-auto object-cover rounded border border-gray-200" />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3 text-justify">
        Un municipio vivo es aquel donde su gente se encuentra, comparte y participa. En la <strong>Agenda Municipal</strong> recopilamos todas las actividades programadas para que no te pierdas nada de lo que ocurre en nuestras parroquias.
      </p>

      <p className="text-sm text-gray-700 leading-relaxed text-justify mb-4">
        Desde jornadas de salud gratuitas, mercados a cielo abierto y asambleas ciudadanas, hasta ferias patronales, conciertos y eventos recreativos. Mantente informado, planifica tu semana y sé parte activa de la vida comunitaria de Rafael Rangel.
      </p>
    </div>
  </ListadoCategoria>
);

export default Eventos;
