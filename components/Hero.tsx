import React, { useState, useEffect } from 'react';
import type { HeroSlide } from '../types';

interface HeroProps {
  slides: HeroSlide[];
}

const fallbackImage = 'https://picsum.photos/1920/1080';

const Hero: React.FC<HeroProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!slides.length) {
      setCurrentSlide(0);
      return undefined;
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToContact = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen text-white flex items-center justify-center">
      {slides.map((slide, index) => (
        <div
          key={slide.id ?? index}
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${slide.imageUrl || fallbackImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40"></div>
        </div>
      ))}
      <div className="relative z-10 text-center max-w-4xl px-4 overflow-hidden">
        {slides.map((slide, index) => (
            <div key={slide.id ?? index} style={{ animationDelay: `${index * 100}ms` }} className={`transition-all duration-1000 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {slide.supertitle && (
                  <h3 className="text-lg md:text-xl font-semibold text-brand-secondary mb-2 animate-slide-in-up text-shadow-md shadow-black/50" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                    {slide.supertitle}
                  </h3>
                )}
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight animate-slide-in-up text-shadow-lg shadow-black/60" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>{slide.title}</h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto animate-slide-in-up text-shadow-md shadow-black/50" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>{slide.subtitle}</p>
            </div>
        ))}
        <button onClick={scrollToContact} className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full font-bold text-white hover:scale-105 transform transition-transform duration-300 animate-pulse text-shadow-md shadow-black/30">
          Start Your Project
        </button>
      </div>
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-brand-secondary scale-125' : 'bg-white/50 hover:bg-white/80'}`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
