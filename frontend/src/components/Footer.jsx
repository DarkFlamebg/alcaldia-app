import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null); // 'privacidad', 'terminos', 'cookies' o null

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("¡Gracias por suscribirte al Boletín Informativo de la Alcaldía! (Fase 2)");
  };

  return (
    <footer className="bg-[#0f172a] text-gray-300 pt-14 pb-8 px-6 mt-12 border-t-4 border-red-700 relative">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
     {/* 1. Identidad Corporativa */}
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-5">
            {/* Logo con tratamiento de insignia (marco sutil) */}
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <img src="/img/LogoAlcaldia1.png" alt="Logo Alcaldía" className="h-12 w-auto object-contain rounded" />
            </div>
            
            {/* Texto integrado al fondo oscuro con mejor tipografía */}
            <h4 className="text-white font-extrabold text-lg uppercase tracking-wider leading-tight">
              Alcaldía del Municipio <br/>
              <span className="text-red-500 text-sm font-semibold tracking-widest">Rafael Rangel</span>
            </h4>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed pr-4">
            Portal Oficial de Noticias e Información Institucional. Compromiso, gestión transparente y desarrollo social para todo el municipio.
          </p>
        </div>

        {/* 2. Navegación Secundaria (Botones funcionales) */}
        <div>
          <h4 className="text-white font-bold text-base mb-5 uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">
            Accesos Rápidos
          </h4>
          <ul className="text-sm space-y-3 text-gray-400">
            <li>
              <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-red-400 transition-colors flex items-center gap-2">
                <span className="text-red-700 text-xs">▸</span> Inicio
              </Link>
            </li>
            <li>
              <Link to="/institucional" onClick={() => window.scrollTo(0, 0)} className="hover:text-red-400 transition-colors flex items-center gap-2">
                <span className="text-red-700 text-xs">▸</span> Institucional
              </Link>
            </li>
            <li>
              <Link to="/turismo" onClick={() => window.scrollTo(0, 0)} className="hover:text-red-400 transition-colors flex items-center gap-2">
                <span className="text-red-700 text-xs">▸</span> Rutas Turísticas
              </Link>
            </li>
            <li>
              <Link to="/cultura" onClick={() => window.scrollTo(0, 0)} className="hover:text-red-400 transition-colors flex items-center gap-2">
                <span className="text-red-700 text-xs">▸</span> Agenda Cultural
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Contacto y Soporte (Datos de Google) */}
        <div>
          <h4 className="text-white font-bold text-base mb-5 uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">
            Contacto Oficial
          </h4>
          <ul className="text-sm space-y-4 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-0.5">📍</span> 
              <span>Avenida 5, vía Betijoque - Valera, frente a la Plaza Bolívar, Sector Betijoque, Estado Trujillo.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-red-500">📞</span> (0271) 663-0642 / 663-2100
            </li>
            <li className="flex items-center gap-3">
              <span className="text-red-500">✉️</span> prensa@rafaelrangel.gob.ve
            </li>
          </ul>
        </div>

        {/* 4. Conversión y Social (Redes Oficiales) */}
        <div>
          <h4 className="text-white font-bold text-base mb-5 uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">
            Boletín Informativo
          </h4>
          <p className="text-xs text-gray-400 mb-3">Suscríbete para recibir noticias en tu correo electrónico.</p>
          
          <form onSubmit={handleSubscribe} className="flex mb-6 shadow-sm">
            <input type="email" placeholder="Tu correo electrónico" className="w-full bg-gray-800/50 text-sm text-white px-3 py-2 outline-none focus:ring-1 focus:ring-red-500 border border-gray-700 border-r-0 rounded-l-md" required />
            <button type="submit" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 text-sm font-bold transition-colors rounded-r-md cursor-pointer">OK</button>
          </form>

          <div className="flex gap-3">
            <a href="https://facebook.com/AlcaldiaRafaelRangel" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors p-2.5 bg-gray-800 rounded-full hover:bg-gray-700" title="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="https://instagram.com/alcaldiarafael" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors p-2.5 bg-gray-800 rounded-full hover:bg-gray-700" title="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
            </a>
            <a href="https://x.com/ABBetijoque" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2.5 bg-gray-800 rounded-full hover:bg-gray-700" title="X (Twitter)">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-gray-500 text-center md:text-left">
          <p>© {new Date().getFullYear()} Alcaldía Bolivariana del Municipio Rafael Rangel.</p>
          <p>Rif: G-20000000-0. Todos los derechos reservados.</p>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-3 text-xs text-gray-400">
          <button onClick={() => setActiveModal('privacidad')} className="hover:text-red-400 transition-colors cursor-pointer">Política de Privacidad</button>
          <span className="text-gray-600">|</span>
          <button onClick={() => setActiveModal('terminos')} className="hover:text-red-400 transition-colors cursor-pointer">Términos de Uso</button>
          <span className="text-gray-600">|</span>
          <button onClick={() => setActiveModal('cookies')} className="hover:text-red-400 transition-colors cursor-pointer">Aviso de Cookies</button>
        </div>
      </div>

      {/* ... VENTANAS MODALES IGUALES ... */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-lg max-w-lg w-full p-6 shadow-2xl border-t-4 border-red-700 relative animate-fadeIn">
            <button onClick={() => setActiveModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-red-700 text-xl font-bold p-1 cursor-pointer">✕</button>
            
            {activeModal === 'privacidad' && (
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-3 border-b pb-2">Política de Privacidad</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">El portal institucional de la Alcaldía del Municipio Rafael Rangel garantiza la protección de los datos de los ciudadanos conforme a las leyes vigentes.</p>
              </div>
            )}
            
            {activeModal === 'terminos' && (
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-3 border-b pb-2">Términos de Uso</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">Los contenidos de este portal son de carácter público e informativo. Su reproducción parcial o total requiere la citación oficial de la fuente institucional.</p>
              </div>
            )}
            
            {activeModal === 'cookies' && (
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-3 border-b pb-2">Aviso de Cookies</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de usuario y ofrecer una navegación más fluida.</p>
              </div>
            )}

            <button onClick={() => setActiveModal(null)} className="mt-6 w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded text-sm transition-colors cursor-pointer">
              Entendido
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;