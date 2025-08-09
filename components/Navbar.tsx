"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingBag, LogIn, Package } from "lucide-react"
import { UserPlus } from "lucide-react"
import type { Session } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useCart } from "../lib/cart-context"
import UserMenu from "./UserMenu"
import { useSession } from './SessionProvider'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSizeChangeModal, setShowSizeChangeModal] = useState(false)
  const session = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { itemCount } = useCart()
  const supabase = createClientComponentClient()

  // Asegurar que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
    setIsLoading(false)
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
  }, [session, supabase])

  const menuItems = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
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

  const handleSizeChangeClick = () => {
    console.log('Size change button clicked')
    setShowSizeChangeModal(true)
  }

  const handleWhatsAppContact = () => {
    const phoneNumber = '5216143716816' // Same number as in Hero
    const message = encodeURIComponent('¡Hola! Me interesa información sobre cambio de talla para mi compra. ¿Podrían ayudarme con los requerimientos?')
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
    setShowSizeChangeModal(false)
  }

  // Show loading state during initial load
  if (!isClient || isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-34 py-1">
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="Maydel Fajas" width={360} height={120} className="h-32 w-auto" priority />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <div key={item.href} className="text-gray-600">
                  {item.label}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 rounded-full w-8 h-8"></div>
              <div className="animate-pulse bg-gray-200 rounded-full w-8 h-8"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-36 py-2">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="Maydel Fajas" width={360} height={120} className="h-32 w-auto" priority />
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
                      <button
                        onClick={handleSizeChangeClick}
                        className="text-base font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap px-3 py-2 rounded-lg hover:bg-primary/10"
                      >
                        ¿Necesitas cambio de talla?
                      </button>
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
                    </>
                  )}
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
                  <UserMenu role={userRole} />
                </>
              ) : (
                <div className="flex items-center space-x-3">
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
                  <Link href="/auth" className="flex items-center space-x-2 btn-secondary">
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link href="/auth?mode=register" className="flex items-center space-x-2 btn-primary">
                    <UserPlus className="w-4 h-4" />
                    <span>Registrarse</span>
                  </Link>
                </div>
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
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative z-[10000]"
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
                            <button
                              onClick={handleSizeChangeClick}
                              className="text-left text-base font-medium text-primary hover:text-primary/80 transition-colors py-2 px-3 rounded-lg hover:bg-primary/10"
                            >
                              ¿Necesitas cambio de talla?
                            </button>
                            <Link
                              href="/pedidos"
                              className="flex items-center space-x-2 text-gray-600 py-2"
                              onClick={handleMenuClose}
                            >
                              <Package className="w-5 h-5" />
                              <span>Mis Pedidos</span>
                            </Link>
                          </>
                        )}
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
                      <div className="space-y-3">
                        <Link
                          href="/carrito"
                          className="flex items-center justify-center space-x-2 btn-secondary w-full"
                          onClick={handleMenuClose}
                        >
                          <ShoppingBag className="w-5 h-5" />
                          <span>Carrito</span>
                          {itemCount > 0 && (
                            <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {itemCount > 99 ? "99+" : itemCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/auth"
                          className="flex items-center justify-center space-x-2 btn-secondary w-full"
                          onClick={handleMenuClose}
                        >
                          <LogIn className="w-5 h-5" />
                          <span>Iniciar Sesión</span>
                        </Link>
                        <Link
                          href="/auth?mode=register"
                          className="flex items-center justify-center space-x-2 btn-primary w-full"
                          onClick={handleMenuClose}
                        >
                          <UserPlus className="w-5 h-5" />
                          <span>Registrarse</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Size Change Modal */}
      {showSizeChangeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowSizeChangeModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Cambio de Talla</h3>
            <p className="text-gray-600 mb-6">
              Contactame por whatsapp para poder ver los requerimientos en caso de requerir cambio de talla para tu compra
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSizeChangeModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleWhatsAppContact}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Image
                  src="/whatsapp-svgrepo-white.svg"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                />
                Contactar por WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}