import Hero from './Hero';
import NewsCard from './NewsCard';
import { useDatos } from '../portal/useDatos';

// Portada: las 2 noticias más recientes de cada categoría, desde la BD.
const Inicio = () => {
  const { datos, error, cargando } = useDatos('/inicio?por_categoria=2');
  const categorias = datos?.data ?? [];

  return (
    <div className="w-full">
      <Hero />

      <div className="bg-gray-100 py-12 px-6">
        <div className="max-w-[1400px] mx-auto w-full space-y-12">
          {error && (
            <p className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">{error.message}</p>
          )}
          {!error && !cargando && categorias.length === 0 && (
            <p className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
              Todavía no hay noticias publicadas.
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {categorias.map((cat) => (
              <div key={cat.slug} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="border-l-4 border-red-700 pl-3 mb-6">
                  <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                    {cat.nombre}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {cat.noticias.map((noticia) => (
                    <NewsCard key={noticia.id} data={noticia} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
