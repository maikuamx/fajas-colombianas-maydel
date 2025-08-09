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
  productSizes?: Array<{
    id: string;
    size: string;
  }>;
  userRole?: string | null;
  isAuthenticated: boolean;
  className?: string;
  // Props for direct add (from product details page)
  directAdd?: boolean;
  selectedColor?: string;
  selectedSize?: string;
  quantity?: number;
  onAddToCart?: () => void;
}

export default function CartButton({ 
  productId, 
  productColors = [], 
  productSizes = [],
  userRole, 
  isAuthenticated: initialAuth, 
  className = '',
  directAdd = false,
  selectedColor,
  selectedSize,
  quantity = 1,
  onAddToCart
}: CartButtonProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [internalSelectedColor, setInternalSelectedColor] = useState<string | null>(null);
  const [internalSelectedSize, setInternalSelectedSize] = useState<string | null>(null);
  const [internalQuantity, setInternalQuantity] = useState(1);
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

  const handleAddToCart = async (colorId?: string, sizeId?: string, qty?: number) => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (userRole === 'admin') {
      return;
    }

    setIsAdding(true);
    try {
      const finalQuantity = qty || quantity || internalQuantity;
      console.log('Adding to cart:', { productId, colorId, sizeId, quantity: finalQuantity });
      await addToCart(productId, colorId, finalQuantity);
      setShowColorPicker(false);
      setInternalQuantity(1);
      setInternalSelectedColor(null);
      setInternalSelectedSize(null);
      
      // Call external callback if provided
      if (onAddToCart) {
        onAddToCart();
      }
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

    // If directAdd is true, add directly with provided values
    if (directAdd) {
      handleAddToCart(selectedColor, selectedSize, quantity);
      return;
    }

    // Otherwise show picker if colors are available
    if (productColors.length > 0 || productSizes.length > 0) {
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
                      onClick={() => setInternalSelectedColor(color.id)}
                      className={`relative w-8 h-8 rounded-full border-2 ${
                        internalSelectedColor === color.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.color_code }}
                      title={color.color_name}
                    >
                      {internalSelectedColor === color.id && (
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
                    onClick={() => setInternalQuantity(Math.max(1, internalQuantity - 1))}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm">{internalQuantity}</span>
                  <button
                    onClick={() => setInternalQuantity(internalQuantity + 1)}
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
                    setInternalSelectedColor(null);
                    setInternalQuantity(1);
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAddToCart(internalSelectedColor || undefined, internalSelectedSize || undefined, internalQuantity)}
                  disabled={isAdding || (productColors.length > 0 && !internalSelectedColor)}
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