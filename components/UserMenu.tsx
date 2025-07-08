'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    
    try {
      console.log('UserMenu: Starting sign out process');
      
      // Clear local storage first
      localStorage.removeItem('cart_session_id');
      
      // Sign out from Supabase with proper scope
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw error for 401 (already signed out)
        if (error.status !== 401) {
          throw error;
        }
      }

      console.log('UserMenu: Sign out successful');

      // Close menu and callback
      setIsOpen(false);
      if (onClose) onClose();
      
      toast.success('Sesión cerrada exitosamente');
      
      // Force complete page refresh to clear all state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
      setIsSigningOut(false);
    }
  };

  if (isMobile) {
    return (
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors py-2 disabled:opacity-50"
      >
        <LogOut className="w-5 h-5" />
        <span>{isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
        disabled={isSigningOut}
      >
        <User className="w-6 h-6" />
        <span className="absolute top-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Mi Cuenta
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          {role === 'admin' ? (
            <Link
              href="/admin"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
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
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
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
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
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
          <hr className="my-1 border-gray-200" />
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      )}
    </div>
  );
}