'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface UserMenuProps {
  role: string | null;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function UserMenu({ role, isMobile, onClose }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsOpen(false);
      if (onClose) onClose();
      
      router.refresh();
      router.push('/');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  if (isMobile) {
    return (
      <button
        onClick={handleSignOut}
        className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors py-2"
      >
        <LogOut className="w-5 h-5" />
        <span>Cerrar Sesión</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
      >
        <User className="w-6 h-6" />
        <span className="absolute top-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Mi Cuenta
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          {role === 'admin' ? (
            <Link
              href="/admin"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
            >
              <Settings className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/perfil"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
              >
                <User className="w-5 h-5 mr-2" />
                Mi Perfil
              </Link>
              <Link
                href="/pedidos"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
              >
                <Package className="w-5 h-5 mr-2" />
                Mis Pedidos
              </Link>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}