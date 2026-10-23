import React from 'react';
import { Link } from 'react-router-dom';

const Institucional = () => {
  return (
    <div className="bg-gray-200 min-h-screen pb-16">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 pt-8">
        
        {/* Navegación (Breadcrumb) */}
        <div className="text-sm font-medium mb-6 flex items-center gap-2">
          <Link className="text-red-700 hover:underline" to="/">Inicio</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Institucional</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Nuestra Institución</h1>

        <div className="bg-white shadow-sm border border-gray-100 p-8 lg:p-12 flex flex-col gap-12">
          
          {/* SECCIÓN 1: Símbolos Institucionales */}
          <div className="border-b border-gray-200 pb-12">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-red-700 pl-3 mb-8">
              Símbolos Patrios e Institucionales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              
              {/* Escudo */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="h-44 flex items-center justify-center mb-4">
                  <img 
                    src="/img/EscudoMunicipio1.jpg" 
                    alt="Escudo del Municipio Rafael Rangel" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">Escudo Municipal</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Identidad y Heráldica</p>
              </div>

              {/* Bandera */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="h-44 flex items-center justify-center mb-4">
                  <img 
                    src="/img/BanderaMunicipio1.jpg" 
                    alt="Bandera del Municipio Rafael Rangel" 
                    className="max-h-full max-w-full object-contain border border-gray-200 rounded"
                  />
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">Bandera Municipal</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pabellón Local</p>
              </div>

              {/* Logo Concejo / Eslogan */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="h-44 flex items-center justify-center mb-4">
                  <img 
                    src="/img/LogoMunicipio2.jpg" 
                    alt="Emblema del Concejo Municipal Rafael Rangel" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">Concejo Municipal</h4>
                <p className="text-xs text-red-700 uppercase tracking-wider font-bold">"Legislando para el Pueblo"</p>
              </div>

            </div>
          </div>

          {/* SECCIÓN 2: Misión y Visión */}
          <div className="border-b border-gray-200 pb-12">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-red-700 pl-3 mb-6">Nuestra Filosofía</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  Visión
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed text-justify">
                  Convertir al Municipio Rafael Rangel en el principal referente de desarrollo turístico-religioso, cultural y agrícola del occidente venezolano, garantizando servicios públicos eficientes, seguridad y calidad de vida para los habitantes de Betijoque, Los Cedros, La Pueblita y José Gregorio Hernández.
                </p>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Misión
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed text-justify">
                  Administrar los recursos municipales con transparencia, planificando políticas públicas que impulsen el crecimiento económico local, promoviendo la cultura, la educación y la salud, en trabajo conjunto con las comunidades organizadas.
                </p>
              </section>

            </div>
          </div>

          {/* SECCIÓN 3: Reseña Histórica */}
          <div className="border-b border-gray-200 pb-12">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-red-700 pl-3 mb-6">Reseña Histórica</h3>
            <div className="columns-1 md:columns-2 gap-8 text-gray-700 leading-relaxed text-justify space-y-4">
              <p>
                El territorio que hoy conforma nuestro municipio tiene sus raíces en el histórico asentamiento de Betijoque hacia el año 1773. Por su ubicación estratégica en la geografía trujillana, fue elevado a la categoría de cantón en 1843.
              </p>
              <p>
                En 1977, la jurisdicción fue rebautizada como <strong>Municipio Rafael Rangel</strong>, en honor a su hijo más ilustre, el sabio investigador y padre de la parasitología en Venezuela.
              </p>
              <p>
                Hoy en día, el municipio es reconocido a nivel nacional e internacional por albergar en la población de Isnotú el Santuario del Venerable <strong>Dr. José Gregorio Hernández</strong>, siendo el epicentro de la fe devocional y el turismo religioso de la región.
              </p>
            </div>
          </div>

          {/* SECCIÓN 4: Autoridades y Organigrama */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-red-700 pl-3 mb-8">Estructura Organizativa</h3>
            
            {/* Despacho del Alcalde */}
            <div className="flex justify-center mb-10">
              <div className="bg-red-700 text-white p-6 rounded-lg shadow-md text-center w-full max-w-md">
                <h4 className="text-xl font-bold mb-1">Lcda. Sonia Silva</h4>
                <p className="text-red-100 font-medium">Alcaldesa del Municipio Rafael Rangel</p>
              </div>
            </div>

            {/* Departamentos */}
            <h4 className="text-lg font-bold text-gray-800 mb-6 text-center">Direcciones Principales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow rounded-md">
                <h5 className="font-bold text-red-700 mb-2">Dirección de Despacho y General</h5>
                <p className="text-sm text-gray-600 text-justify">Coordina las políticas públicas dictadas por la Alcaldesa, gestiona la atención al ciudadano y enlaza la comunicación entre todas las dependencias municipales.</p>
              </div>

              <div className="bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow rounded-md">
                <h5 className="font-bold text-red-700 mb-2">Administración y Finanzas</h5>
                <p className="text-sm text-gray-600 text-justify">Administra los recursos financieros, el presupuesto participativo y la recaudación de impuestos (Hacienda Municipal) garantizando la transparencia de los fondos.</p>
              </div>

              <div className="bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow rounded-md">
                <h5 className="font-bold text-red-700 mb-2">Ingeniería y Obras Públicas</h5>
                <p className="text-sm text-gray-600 text-justify">Planifica, diseña y ejecuta los proyectos de infraestructura, vialidad, alumbrado y mantenimiento de los espacios públicos del municipio.</p>
              </div>

              <div className="bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow rounded-md">
                <h5 className="font-bold text-red-700 mb-2">Desarrollo Social y Salud</h5>
                <p className="text-sm text-gray-600 text-justify">Atiende a las comunidades vulnerables, coordina jornadas médicas, entrega de ayudas técnicas y enlaza con las misiones sociales nacionales.</p>
              </div>

              <div className="bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow rounded-md">
                <h5 className="font-bold text-red-700 mb-2">Turismo y Cultura</h5>
                <p className="text-sm text-gray-600 text-justify">Promueve las rutas turísticas, el Santuario de Isnotú y salvaguarda las tradiciones folclóricas, históricas y artísticas de nuestras 4 parroquias.</p>
              </div>

              <div className="bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow rounded-md">
                <h5 className="font-bold text-red-700 mb-2">Sindicatura Municipal</h5>
                <p className="text-sm text-gray-600 text-justify">Representa, defiende y asesora legalmente a la Alcaldía en todos los actos jurídicos, protegiendo los bienes y el patrimonio del municipio.</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Institucional;