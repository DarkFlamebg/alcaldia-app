import ListadoCategoria from '../portal/ListadoCategoria';

// Las noticias de Mundo salen de la base de datos (ver portal/ListadoCategoria.jsx).
// Aquí solo queda el contenido propio de la barra lateral.
const Mundo = () => (
  <ListadoCategoria slug="mundo" nombre="Mundo">
    <div className="bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="border-l-4 border-red-700 pl-3 text-lg font-bold text-gray-800 mb-5">Visión Global</h3>

      <div className="mb-4 rounded overflow-hidden bg-gray-50 flex justify-center">
        <img src="/img/Mundo2.jpg" alt="Noticias Globales" className="w-full h-auto object-cover rounded border border-gray-200" />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3 text-justify">
        Porque el desarrollo de nuestro municipio no ocurre de manera aislada, consideramos vital mantener a la comunidad rangeliana conectada con los grandes acontecimientos globales. Las noticias internacionales impactan nuestra economía, tecnología y visión de futuro.
      </p>

      <p className="text-sm text-gray-700 leading-relaxed text-justify mb-4">
        La sección <strong>Mundo</strong> está diseñada para acercarte el acontecer internacional, brindándote un panorama amplio para entender mejor los cambios y avances del planeta, todo desde nuestra propia perspectiva local.
      </p>
    </div>
  </ListadoCategoria>
);

export default Mundo;
