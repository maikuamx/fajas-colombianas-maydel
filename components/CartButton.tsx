'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface CartButtonProps {
  productId: string;
  userRole?: string | null;
  isAuthenticated: boolean;
  className?: string;
}

export default function CartButton({ productId, userRole, isAuthenticated, className = '' }: CartButtonProps) {
  const router = useRouter();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (userRole === 'admin') {
      toast.error('Los administradores no pueden agregar productos al carrito');
      return;
    }

    // Here we'll add the cart functionality later
    toast.success('Producto agregado al carrito');
  };

  if (userRole === 'admin') {
    return null;
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors ${className}`}
    >
      <ShoppingCart className="w-5 h-5" />
    </button>
  );
}