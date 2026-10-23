// src/components/Portales.jsx
export default function Portales() {
  return (
    <div className="max-w-5xl mx-auto px-4 mt-10 mb-6">
      
      {/* Título de la sección */}
      <div className="mb-4 border-l-4 border-red-700 pl-3">
        <h2 className="text-2xl font-bold text-gray-800">Portales</h2>
      </div>

      {/* Contenedor de los botones */}
      <div className="flex flex-col sm:flex-row gap-6">
        
        {/* Botón Contribuyente */}
        <a href="#" className="flex-1 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between p-6 cursor-pointer group">
           <div>
             <span className="text-gray-600 text-sm block mb-1">Soy</span>
             <span className="text-black font-extrabold text-xl group-hover:text-red-700 transition-colors">CONTRIBUYENTE</span>
           </div>
           {/* El cuadro rojo de la derecha */}
           <div className="bg-red-700 w-14 h-14 rounded-sm shadow-inner"></div>
        </a>

        {/* Botón Funcionario */}
        <a href="#" className="flex-1 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between p-6 cursor-pointer group">
           <div>
             <span className="text-gray-600 text-sm block mb-1">Soy</span>
             <span className="text-black font-extrabold text-xl group-hover:text-gray-600 transition-colors">FUNCIONARIO</span>
           </div>
           {/* El cuadro gris de la derecha */}
           <div className="bg-gray-500 w-14 h-14 rounded-sm shadow-inner"></div>
        </a>

      </div>
    </div>
  );
}