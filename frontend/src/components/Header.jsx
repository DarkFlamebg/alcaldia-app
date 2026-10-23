import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const location = useLocation();

  // Lista de categorías con sus rutas reales
const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Cultura', path: '/cultura' },
    { name: 'Turismo', path: '/turismo' },
    { name: 'Mundo', path: '/mundo' },
    { name: 'País', path: '/pais' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Deportes', path: '/deportes' },
    { name: 'Institucional', path: '/institucional' }
  ];
  return (
    <header className="w-full shadow-md z-50 relative bg-white">
      <div className="text-gray-800 px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-6 group cursor-pointer">
          <img src="/img/LogoAlcaldia1.png" alt="Logo Alcaldía" className="h-20 sm:h-24 w-auto object-contain transition-transform group-hover:scale-105" />
          <div className="hidden sm:block border-l-2 border-red-700 pl-4">
            <h1 className="font-bold text-2xl uppercase text-red-800 tracking-wide group-hover:text-red-600 transition-colors">
              Alcaldía de Rafael Rangel
            </h1>
            <p className="italic text-sm text-gray-600 font-medium">Historia, Tradición y Desarrollo</p>
          </div>
        </Link>
      </div>

      <div className="bg-red-700 text-white relative z-40 shadow-md">
        <div className="max-w-[1400px] mx-auto flex items-center h-12 px-6 justify-between">
          
          <nav className="hidden md:flex space-x-1 lg:space-x-2 font-semibold text-[11px] lg:text-xs xl:text-sm uppercase tracking-wider h-full">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={index} 
                  to={link.path} 
                  className={`h-full flex items-center px-3 lg:px-4 transition-colors duration-200 border-b-4 ${
                    isActive 
                      ? 'bg-red-900 border-white text-white' // Efecto oscurecido y barra blanca debajo
                      : 'border-transparent hover:bg-red-800 hover:text-red-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <button className="md:hidden p-1 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

       
        {/* Buscador y Menú Admin */}
        <div className="absolute right-6 top-0 h-full flex items-center gap-3 z-50">
          <div className="flex items-center gap-2">
            {isSearchOpen && (
              <input 
                type="text" 
                placeholder="Buscar noticias..." 
                className="px-3 py-1 rounded-full text-sm text-gray-800 focus:outline-none w-40 lg:w-48 transition-all duration-300 shadow-inner" 
                autoFocus 
              />
            )}
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-1 hover:text-red-200 transition-colors" title="Buscar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          <div className="h-5 w-px bg-red-500 mx-1"></div>

          <div className="relative">
            <button 
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)} 
              className="p-1 hover:text-red-200 transition-colors focus:outline-none block cursor-pointer"
              title="Opciones"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2.5" />
                <circle cx="12" cy="12" r="2.5" />
                <circle cx="12" cy="19" r="2.5" />
              </svg>
            </button>

            {isAdminMenuOpen && (
              <div className="absolute top-10 right-0 w-48 bg-white rounded-md shadow-2xl py-2 z-[100] border border-gray-200">
                <Link
                  to="/admin"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-red-700 font-semibold transition-colors cursor-pointer"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Soy Administrador
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-red-800 px-6 py-4">
          <nav className="hidden md:flex space-x-1 lg:space-x-2 font-semibold text-[11px] lg:text-xs xl:text-sm uppercase tracking-wider h-full">
    {navLinks.map((link, index) => {
      const isActive = location.pathname === link.path;
      return (
        <Link 
          key={index} 
          to={link.path} 
          className={`h-full flex items-center px-3 lg:px-4 transition-colors duration-200 border-b-4 ${
            isActive 
              ? 'bg-red-900 border-white text-white' 
              : 'border-transparent hover:bg-red-800 hover:text-red-100'
          }`}
        >
          {link.name}
        </Link>
      );
    })}
  </nav>
        </div>
      )}
    </header>
  );
};

export default Header;