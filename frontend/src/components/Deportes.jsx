import ListadoCategoria from '../portal/ListadoCategoria';

// Las noticias de Deportes salen de la base de datos (ver portal/ListadoCategoria.jsx).
// Aquí solo queda el contenido propio de la barra lateral.
const Deportes = () => (
  <ListadoCategoria slug="deportes" nombre="Deportes">
    <div className="bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="border-l-4 border-red-700 pl-3 text-lg font-bold text-gray-800 mb-5">Deporte Rangeliano</h3>

      <div className="mb-4 rounded overflow-hidden bg-gray-50 flex justify-center">
        <img src="/img/Deportes1.jpg" alt="Atletas del municipio" className="w-full h-auto object-cover rounded border border-gray-200" />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3 text-justify">
        El deporte es una herramienta fundamental para alejar a nuestra juventud del ocio, inculcar disciplina y forjar el carácter de los futuros líderes del municipio. Nos enorgullece ser cuna de atletas que sudan la camiseta y dejan en alto los colores de nuestra bandera local.
      </p>

      <p className="text-sm text-gray-700 leading-relaxed text-justify mb-4">
        Sigue de cerca los campeonatos comunitarios, la recuperación de nuestras canchas, el avance de las ligas menores y los triunfos de nuestros deportistas rangelianos en competencias municipales, estadales y nacionales.
      </p>
    </div>
  </ListadoCategoria>
);

export default Deportes;
