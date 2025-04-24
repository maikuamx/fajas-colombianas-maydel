'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import CartButton from './CartButton';

interface Product {
  id: string;
  name: string;
  description: string;
  prince: number;
  image_url: string;
  product_colors: Array<{
    id: string;
    color_name: string;
    color_code: string;
  }>;
}

interface FeaturedProductsProps {
  products: Product[];
  userRole?: string | null;
  isAuthenticated: boolean;
}

export default function FeaturedProducts({ products, userRole, isAuthenticated }: FeaturedProductsProps) {
  const parseImageUrls = (imageUrl: string | string[]): string[] => {
    if (!imageUrl) return [];
    
    if (typeof imageUrl === 'string') {
      try {
        return JSON.parse(imageUrl);
      } catch {
        return [imageUrl];
      }
    }
    
    return imageUrl;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Productos Destacados
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Descubre nuestra selección de fajas colombianas de alta calidad,
            diseñadas para realzar tu figura con comodidad y estilo.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const imageUrls = parseImageUrls(product.image_url);
            const firstImage = imageUrls[0] || '';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                  <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link
                      href={`/productos/${product.id}`}
                      className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-primary">
                      ${product.prince}
                    </span>
                    <CartButton
                      productId={product.id}
                      userRole={userRole}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                  {product.product_colors && product.product_colors.length > 0 && (
                    <div className="flex gap-1 pt-2">
                      {product.product_colors.map(color => (
                        <div
                          key={color.id}
                          className="group/color relative w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color.color_code }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                            {color.color_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/productos" className="btn-primary">
            Ver Todos los Productos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}