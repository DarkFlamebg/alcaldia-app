import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDatos } from '../portal/useDatos';
import { fechaCorta } from '../portal/formato';

// Carrusel de noticias destacadas (las marcadas como "Destacada" en el panel).
const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { datos } = useDatos('/destacadas?limite=5');
  const destacadas = datos?.data ?? [];
  const total = destacadas.length;
  const actual = total ? currentSlide % total : 0;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.max(total, 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.max(total, 1)) % Math.max(total, 1));

  useEffect(() => {
    if (total < 2) return undefined;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [currentSlide, total]);

  // Sin noticias destacadas: portada fija con la identidad del municipio.
  if (total === 0) {
    return (
      <div className="relative w-full h-[320px] lg:h-[420px] overflow-hidden">
        <img src="/img/Destacadas1.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6">
          <div className="max-w-[1400px] mx-auto w-full">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">Alcaldía de Rafael Rangel</h2>
            <p className="text-gray-200 mt-3 italic">Historia, Tradición y Desarrollo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden group">
      {destacadas.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === actual ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Imagen con zoom suave en el hover */}
          <img 
            src={slide.imagen_url} 
            alt={slide.titulo} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
          
          <Link to={`/noticia/${slide.id}`} className="absolute inset-0 z-10 cursor-pointer"></Link>
          
          <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6 pointer-events-none">
            <div className="max-w-[1400px] mx-auto w-full relative z-20">
              <div className="mb-5">
                <span className="bg-white text-red-800 text-xs font-black px-4 py-1.5 uppercase tracking-[0.2em] border-l-4 border-red-700 shadow-md">
                  Destacada
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {slide.etiquetas.map((tag) => (
                  <span key={tag} className="bg-red-700 text-white text-[10px] sm:text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm shadow-sm pointer-events-auto">
                    {tag}
                  </span>
                ))}
              </div>
              
              <Link to={`/noticia/${slide.id}`} className="inline-block pointer-events-auto group/title">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-5xl group-hover/title:text-red-300 transition-colors duration-300">
                  {slide.titulo}
                </h2>
              </Link>
              
              <p className="text-sm text-gray-300 mt-4 font-light">
                {fechaCorta(slide.publicada_en)} / {slide.categoria.nombre}
              </p>
            </div>
          </div>
        </div>
      ))}

      <button 
        onClick={prevSlide} 
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-red-700 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <button 
        onClick={nextSlide} 
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-red-700 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      <div className="absolute bottom-6 left-0 right-0 z-30 px-6 pointer-events-none">
        <div className="max-w-[1400px] mx-auto w-full flex justify-end gap-2 pointer-events-auto">
          {destacadas.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-500 rounded-full ${index === actual ? 'w-8 h-2 bg-red-600' : 'w-2 h-2 bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;