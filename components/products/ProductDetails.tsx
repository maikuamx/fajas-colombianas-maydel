'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  prince: number;
  category: string;
  size: string;
  image_url: string;
  product_colors: Array<{
    id: string;
    color_name: string;
    color_code: string;
  }>;
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.product_colors[0]?.id || null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

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

  const imageUrls = parseImageUrls(product.image_url);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="lg:w-2/3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <motion.img
              key={currentImageIndex}
              src={imageUrls[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {imageUrls.map((url, index) => (
                <button
                  key={url}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    index === currentImageIndex ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <img
                    src={url}
                    alt={`${product.name} - Vista ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:w-1/3 space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div>
            <span className="text-3xl font-bold text-primary">
              ${product.prince}
            </span>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {product.size && (
            <div>
              <h3 className="font-semibold mb-2">Talla</h3>
              <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                {product.size}
              </div>
            </div>
          )}

          {product.product_colors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Color</h3>
              <div className="flex gap-3">
                {product.product_colors.map((color) => (
                  <div
                    key={color.id}
                    className="relative"
                  >
                    <button
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full relative group/color ${
                        selectedColor === color.id
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : ''
                      }`}
                      style={{ backgroundColor: color.color_code }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                        {color.color_name}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Cantidad</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100 rounded-l-lg"
                  disabled={quantity === 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100 rounded-r-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Disponible en stock
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button className="flex-1 btn-primary flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Agregar al Carrito
            </button>
            <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          <div className="border-t pt-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Categoría:</span>
              <Link
                href={`/productos?categoria=${product.category}`}
                className="text-primary hover:underline"
              >
                {product.category}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}