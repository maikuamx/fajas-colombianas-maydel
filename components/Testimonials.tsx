'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Link from 'next/link';

const testimonials = [
  {
    name: 'Ana García',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'Cliente Verificada',
    content: 'Las fajas de Maydel son increíbles. La calidad es excepcional y el servicio al cliente es excelente. ¡Totalmente recomendado!',
    rating: 5,
  },
  {
    name: 'María Rodríguez',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'Cliente Verificada',
    content: 'Encontré la faja perfecta gracias al asesoramiento personalizado. La comodidad y los resultados superaron mis expectativas.',
    rating: 5,
  },
  {
    name: 'Laura Martínez',
    image: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'Cliente Verificada',
    content: 'La mejor inversión que he hecho. La faja es cómoda, duradera y los resultados son visibles desde el primer uso.',
    rating: 5,
  },
];

export default function Testimonials() {
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
            Lo que dicen nuestras clientas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre por qué miles de mujeres confían en Maydel Fajas para
            realzar su figura con confianza y comodidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-secondary/20 rounded-2xl p-6 relative"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="inline-block w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              <p className="text-gray-600">{testimonial.content}</p>

              <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary/10 rounded-full" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-primary/10 rounded-full" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/testimonios" className="btn-secondary">
            Ver Más Testimonios
          </Link>
        </motion.div>
      </div>
    </section>
  );
}