"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingBag, LogIn, Package } from "lucide-react"
import type { Session } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useCart } from "../lib/cart-context"
import UserMenu from "./UserMenu"
import { useSession } from './SessionProvider'

interface NavbarProps {
  session: Session | null
  userRole: string | null
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const session = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { itemCount } = useCart()
  const supabase = createClientComponentClient()

  // Asegurar que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
    console.log("Navbar mounted on client")
  }, [])

  // Mantener la sesión actualizada
useEffect(() => {
  if (!session) {
    setUserRole(null)
    return
  }

  const fetchRole = async () => {
    try {
      const supabase = createClientComponentClient()
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setUserRole(null)
      } else {
        setUserRole(profile?.role ?? null)
      }
    } catch (error) {
      console.error('Error fetching role:', error)
      setUserRole(null)
    }
  }

  fetchRole()
}, [session])

  const menuItems = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
  ]

  const handleMenuToggle = () => {
    console.log("Menu toggle clicked")
    setIsMenuOpen(!isMenuOpen)
  }

  const handleMenuClose = () => {
    console.log("Menu close triggered")
    setIsMenuOpen(false)
  }

  const handleCartClick = (e: React.MouseEvent) => {
    console.log("Cart clicked")
    // No prevenir default, dejar que Next.js maneje la navegación
  }

  const handleOrdersClick = (e: React.MouseEvent) => {
    console.log("Orders clicked")
    // No prevenir default, dejar que Next.js maneje la navegación
  }

  // No renderizar hasta que estemos en el cliente
  if (!isClient) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="Maydel Fajas" width={120} height={40} className="h-10 w-auto" priority />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-600 hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Cargando...</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="Maydel Fajas" width={120} height={40} className="h-10 w-auto" priority />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-600 hover:text-primary transition-colors">
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                {userRole !== "admin" && (
                  <>
                    <Link
                      href="/pedidos"
                      onClick={handleOrdersClick}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
                      title="Mis Pedidos"
                    >
                      <Package className="w-6 h-6" />
                      <span className="absolute top-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Mis Pedidos
                      </span>
                    </Link>
                    <Link
                      href="/carrito"
                      onClick={handleCartClick}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
                      title="Carrito"
                    >
                      <ShoppingBag className="w-6 h-6" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {itemCount > 99 ? "99+" : itemCount}
                        </span>
                      )}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Carrito ({itemCount})
                      </span>
                    </Link>
                  </>
                )}
                <UserMenu role={userRole} />
              </>
            ) : (
              <Link href="/auth" className="flex items-center space-x-2 btn-primary">
                <LogIn className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={handleMenuToggle}
            type="button"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
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
                    onClick={handleMenuClose}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  {session ? (
                    <div className="flex flex-col space-y-4">
                      {userRole !== "admin" && (
                        <>
                          <Link
                            href="/pedidos"
                            className="flex items-center space-x-2 text-gray-600 py-2"
                            onClick={handleMenuClose}
                          >
                            <Package className="w-5 h-5" />
                            <span>Mis Pedidos</span>
                          </Link>
                          <Link
                            href="/carrito"
                            className="flex items-center space-x-2 text-gray-600 py-2"
                            onClick={handleMenuClose}
                          >
                            <ShoppingBag className="w-5 h-5" />
                            <span>Carrito</span>
                            {itemCount > 0 && (
                              <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {itemCount > 99 ? "99+" : itemCount}
                              </span>
                            )}
                          </Link>
                        </>
                      )}
                      <Link
                        href={userRole === "admin" ? "/admin" : "/perfil"}
                        className="text-gray-600 hover:text-primary transition-colors py-2"
                        onClick={handleMenuClose}
                      >
                        {userRole === "admin" ? "Dashboard" : "Mi Perfil"}
                      </Link>
                      <div className="pt-2">
                        <UserMenu role={userRole} isMobile onClose={handleMenuClose} />
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/auth"
                      className="flex items-center justify-center space-x-2 btn-primary w-full"
                      onClick={handleMenuClose}
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
  )
}
