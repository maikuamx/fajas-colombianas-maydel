'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import CartButton from '../CartButton';

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
  product_sizes?: Array<{
    id: string;
    size: string;
  }>;
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.product_colors[0]?.id || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.product_sizes?.[0]?.id || null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

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

  const handleAddToCart = () => {
    setIsAdding(true);
    // Reset adding state after a short delay to show feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const canAddToCart = () => {
    // Check if color is required and selected
    if (product.product_colors.length > 0 && !selectedColor) {
      return false;
    }
    // Check if size is required and selected
    if (product.product_sizes && product.product_sizes.length > 0 && !selectedSize) {
      return false;
    }
    return true;
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
              className="w-full h-full object-contain"
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

          {/* Static size display (if no product_sizes array) */}
          {product.size && (!product.product_sizes || product.product_sizes.length === 0) && (
            <div>
              <h3 className="font-semibold mb-2">Talla</h3>
              <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                {product.size || 'N/A'}
              </div>
            </div>
          )}

          {/* Dynamic size selection */}
          {product.product_sizes && product.product_sizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Talla</h3>
              <div className="flex gap-3 flex-wrap">
                {product.product_sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedSize === size.id
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
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
              {product.product_colors.length > 0 && !selectedColor && (
                <p className="text-sm text-red-500 mt-1">Por favor selecciona un color</p>
              )}
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
            <div className="flex-1">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart() || isAdding}
                className="w-full h-12 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Agregando...
                  </>
                ) : (
                  'Agregar al Carrito'
                )}
              </button>
              {/* Hidden CartButton for actual functionality */}
              <div className="hidden">
                <CartButton
                  productId={product.id}
                  productColors={product.product_colors}
                  productSizes={product.product_sizes}
                  userRole={null}
                  isAuthenticated={true}
                  directAdd={true}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  quantity={quantity}
                  onAddToCart={handleAddToCart}
                />
              </div>
            </div>
            <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {/* Validation Messages */}
          {!canAddToCart() && (
            <div className="text-sm text-red-500 space-y-1">
              {product.product_colors.length > 0 && !selectedColor && (
                <p>• Selecciona un color</p>
              )}
              {product.product_sizes && product.product_sizes.length > 0 && !selectedSize && (
                <p>• Selecciona una talla</p>
              )}
            </div>
          )}

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