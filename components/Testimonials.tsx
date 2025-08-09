'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';


const testimonialImages = [
  {
    id: 1,
    url: '/testimonios/testimonio-1.jpeg',
    alt: 'Testimonio de cliente 1',
  },
  {
    id: 2,
    url: '/testimonios/testimonio-2.jpeg',
    alt: 'Testimonio de cliente 2',
  },
  {
    id: 3,
    url: '/testimonios/testimonio-3.jpeg',
    alt: 'Testimonio de cliente 3',
  },
  {
    id: 4,
    url: '/testimonios/testimonio-4.jpeg',
    alt: 'Testimonio de cliente 4',
  },
  {
    id: 5,
    url: '/testimonios/testimonio-5.jpeg',
    alt: 'Testimonio de cliente 5',
  },
  {
    id: 6,
    url: '/testimonios/testimonio-6.jpeg',
    alt: 'Testimonio de cliente 6',
  },
  {
    id: 7,
    url: '/testimonios/testimonio-7.jpeg',
    alt: 'Testimonio de cliente 6',
  },
  {
    id: 8,
    url: '/testimonios/testimonio-8.jpeg',
    alt: 'Testimonio de cliente 6',
  },
  {
    id: 9,
    url: '/testimonios/testimonio-9.jpeg',
    alt: 'Testimonio de cliente 6',
  },
  {
    id: 10,
    url: '/testimonios/testimonio-10.jpeg',
    alt: 'Testimonio de cliente 6',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonialImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [isPlaying]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonialImages.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonialImages.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estas son algunas capturas de pantalla reales de las opiniones y comentarios 
            que nuestros clientes han compartido sobre nuestras fajas colombianas.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Image Display */}
          <div className="relative aspect-[9/16] md:aspect-[9/16] lg:aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={testimonialImages[currentIndex].url}
                alt={testimonialImages[currentIndex].alt}
                className="w-full h-full object-contain bg-white"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} de {testimonialImages.length}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: isPlaying ? "100%" : "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                key={`${currentIndex}-${isPlaying}`}
              />
            </div>
          </div>

          {/* Image Description */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center mt-6"
          >
            <p className="text-lg text-gray-700 font-medium">
            </p>
          </motion.div>

          {/* Thumbnail Navigation */}
          <div className="flex justify-center mt-8 gap-2 flex-wrap max-w-4xl mx-auto">
            {testimonialImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`relative w-12 h-20 md:w-14 md:h-24 rounded-lg overflow-hidden transition-all duration-200 ${
                  index === currentIndex
                    ? 'ring-2 ring-primary ring-offset-2 scale-110'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-contain bg-white"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </button>
            ))}
          </div>

          {/* Dots Navigation (Alternative) */}
          <div className="flex justify-center mt-6 gap-2">
            {testimonialImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-primary scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-primary/5 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-4">¿Quieres ser parte de nuestros clientes satisfechos?</h3>
            <p className="text-gray-600 mb-6">
              Únete a miles de mujeres que ya han transformado su figura con nuestras fajas colombianas de calidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/productos"
                className="btn-primary"
              >
                Ver Productos
              </a>
              <button
                onClick={() => {
                  const phoneNumber = '5216143716816';
                  const message = encodeURIComponent('¡Hola! Vi los testimonios de sus clientes y me interesa conocer más sobre las fajas colombianas Maydel. ¿Podrían ayudarme?');
                  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}