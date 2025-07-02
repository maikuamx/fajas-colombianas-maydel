'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../lib/cart-context';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';

interface CartButtonProps {
  productId: string;
  productColors?: Array<{
    id: string;
    color_name: string;
    color_code: string;
  }>;
  userRole?: string | null;
  isAuthenticated: boolean;
  className?: string;
}

export default function CartButton({ 
  productId, 
  productColors = [], 
  userRole, 
  isAuthenticated: initialAuth, 
  className = '' 
}: CartButtonProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const supabase = createClientComponentClient();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAddToCart = async (colorId?: string) => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (userRole === 'admin') {
      return;
    }

    setIsAdding(true);
    try {
      console.log('Adding to cart:', { productId, colorId, quantity });
      await addToCart(productId, colorId, quantity);
      setShowColorPicker(false);
      setQuantity(1);
      setSelectedColor(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (userRole === 'admin') {
      return;
    }

    if (productColors.length > 0) {
      setShowColorPicker(true);
    } else {
      handleAddToCart();
    }
  };

  if (userRole === 'admin') {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleButtonClick}
        disabled={isAdding}
        className={`p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 ${className}`}
      >
        <ShoppingCart className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border p-4 z-50 min-w-[280px]"
          >
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Seleccionar opciones</h4>
              
              {/* Color Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {productColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`relative w-8 h-8 rounded-full border-2 ${
                        selectedColor === color.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.color_code }}
                      title={color.color_name}
                    >
                      {selectedColor === color.id && (
                        <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setSelectedColor(null);
                    setQuantity(1);
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAddToCart(selectedColor || undefined)}
                  disabled={isAdding || (productColors.length > 0 && !selectedColor)}
                  className="flex-1 px-3 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isAdding ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}