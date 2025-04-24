'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, LogIn } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import UserMenu from './UserMenu';

interface NavbarProps {
  session: Session | null;
  userRole: string | null;
}

export default function Navbar({ session, userRole }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Productos' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Maydel Fajas"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                {userRole !== 'admin' && (
                  <Link
                    href="/carrito"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
                  >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      0
                    </span>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Carrito
                    </span>
                  </Link>
                )}
                <UserMenu role={userRole} />
              </>
            ) : (
              <Link
                href="/auth"
                className="flex items-center space-x-2 btn-primary"
              >
                <LogIn className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-600 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  {session ? (
                    <div className="flex flex-col space-y-4">
                      {userRole !== 'admin' && (
                        <Link
                          href="/carrito"
                          className="flex items-center space-x-2 text-gray-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShoppingBag className="w-5 h-5" />
                          <span>Carrito</span>
                          <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            0
                          </span>
                        </Link>
                      )}
                      <Link
                        href={userRole === 'admin' ? '/admin' : '/perfil'}
                        className="text-gray-600 hover:text-primary transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {userRole === 'admin' ? 'Dashboard' : 'Mi Perfil'}
                      </Link>
                      <UserMenu role={userRole} isMobile onClose={() => setIsMenuOpen(false)} />
                    </div>
                  ) : (
                    <Link
                      href="/auth"
                      className="flex items-center justify-center space-x-2 btn-primary w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}