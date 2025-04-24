'use client';

import { motion } from 'framer-motion';
import { Shield, Truck, RefreshCw, Heart } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Calidad Garantizada',
    description: 'Productos de alta calidad con los mejores materiales colombianos.',
  },
  {
    icon: Truck,
    title: 'Envío Rápido',
    description: 'Entrega a todo México en 2-3 días hábiles.',
  },
  {
    icon: RefreshCw,
    title: 'Devolución Sencilla',
    description: '30 días para cambios y devoluciones sin complicaciones.',
  },
  {
    icon: Heart,
    title: 'Atención Personalizada',
    description: 'Asesoramiento experto para encontrar tu faja ideal.',
  },
];

export default function Benefits() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Por qué elegir Maydel Fajas?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nos dedicamos a brindarte la mejor experiencia con productos de calidad
            y un servicio excepcional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-block p-4 rounded-full bg-white shadow-md mb-6 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}