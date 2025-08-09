'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, CreditCard, MapPin, Store } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../lib/cart-context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ShippingAddressForm from '../shipping/ShippingAdressForm';
import BillingForm from '../billing/BillingForm';

interface CartPageProps {
  isAuthenticated?: boolean;
}

interface ShippingAddress {
  id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  shipping_cost: number;
  is_pickup?: boolean;
}

interface AnonymousShippingData {
  name: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  shipping_cost: number;
}

export default function CartPage({ isAuthenticated = false }: CartPageProps) {
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [anonymousShipping, setAnonymousShipping] = useState<AnonymousShippingData | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAnonymousForm, setShowAnonymousForm] = useState(false);
  const [pickupSelected, setPickupSelected] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);
  const [anonymousEmail, setAnonymousEmail] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

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

  const subtotal = total;
  const shippingCost = selectedAddress?.shipping_cost || anonymousShipping?.shipping_cost || 0;
  const taxAmount = billingData?.requires_invoice ? subtotal * 0.16 : 0;
  const finalTotal = subtotal + shippingCost + taxAmount;

  const handleCheckout = async () => {
    // Validate shipping information
    if (!selectedAddress && !anonymousShipping && !pickupSelected) {
      toast.error('Por favor selecciona una opción de envío o completa los datos de envío');
      if (!isAuthenticated) {
        setShowAnonymousForm(true);
      } else {
        setShowAddressForm(true);
      }
      return;
    }

    // Validate email for anonymous users if they want confirmation
    if (!isAuthenticated && !anonymousEmail) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsProcessing(true);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.product_id,
            color_id: item.color_id,
            quantity: item.quantity,
            price: item.price_at_add,
            name: item.product.name,
            color_name: item.color?.color_name,
          })),
          total: finalTotal,
          shipping_address_id: selectedAddress && selectedAddress.id !== 'pickup' ? selectedAddress.id : null,
          shipping_cost: pickupSelected ? 0 : shippingCost,
          billing_data: billingData,
          tax_amount: taxAmount,
          is_pickup: pickupSelected,
          anonymous_shipping: !isAuthenticated ? anonymousShipping : null,
          anonymous_email: !isAuthenticated ? anonymousEmail : null,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-8">
            Descubre nuestros productos y agrega algunos a tu carrito
          </p>
          <Link href="/productos" className="btn-primary">
            Ver Productos
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Carrito de Compras</h1>
        <p className="text-gray-600">
          {itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu carrito
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const imageUrls = parseImageUrls(item.product.image_url);
              const firstImage = imageUrls[0] || '';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={firstImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      
                      {item.color && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Color:</span>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: item.color.color_code }}
                            />
                            <span className="text-sm">{item.color.color_name}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          ${item.price_at_add}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 rounded-l-lg"
                              disabled={item.quantity === 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 rounded-r-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm text-gray-600">
                          Subtotal: ${(item.price_at_add * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Shipping Address */}
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <ShippingAddressForm
                onAddressSelect={(address) => {
                  setSelectedAddress(address);
                  setPickupSelected(address.is_pickup || false);
                }}
                selectedAddressId={selectedAddress?.id}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <AnonymousShippingForm
                onShippingDataChange={setAnonymousShipping}
                onPickupSelect={setPickupSelected}
                pickupSelected={pickupSelected}
                anonymousEmail={anonymousEmail}
                onEmailChange={setAnonymousEmail}
              />
            </motion.div>
          )}

          {/* Billing Information */}
          {(selectedAddress || anonymousShipping || pickupSelected) && !pickupSelected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <BillingForm
                onBillingDataChange={setBillingData}
                shippingAddress={selectedAddress || anonymousShipping}
              />
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border p-6 sticky top-24"
          >
            <h3 className="text-xl font-semibold mb-6">Resumen del Pedido</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} productos)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {selectedAddress && (
                <div className="flex justify-between">
                  <span>
                    {pickupSelected ? 'Recoger en tienda' : `Envío a ${selectedAddress?.city || anonymousShipping?.city}`}
                  </span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              )}
              
              {anonymousShipping && !pickupSelected && (
                <div className="flex justify-between">
                  <span>Envío a {anonymousShipping.city}</span>
                  <span>${anonymousShipping.shipping_cost.toFixed(2)}</span>
                </div>
              )}
              
              {pickupSelected && (
                <div className="flex justify-between">
                  <span>Recoger en tienda</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
              )}
              
              {billingData?.requires_invoice && (
                <div className="flex justify-between">
                  <span>IVA (16%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing || (!selectedAddress && !anonymousShipping && !pickupSelected) || (!pickupSelected && billingData?.requires_invoice && (!billingData.rfc || !billingData.razon_social || !billingData.full_name || !billingData.email || !billingData.phone)) || (!isAuthenticated && !anonymousEmail)}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              {isProcessing ? 'Procesando...' : 'Proceder al Pago'}
            </button>

            <p className="text-xs text-red-600 text-center mt-2">
              {(!selectedAddress && !anonymousShipping && !pickupSelected) && "Selecciona una opción de envío para continuar"}
              {!pickupSelected && billingData?.requires_invoice && (!billingData.rfc || !billingData.razon_social || !billingData.full_name || !billingData.email || !billingData.phone) && "Complete todos los campos de facturación"}
              {!isAuthenticated && !anonymousEmail && "Ingresa tu correo electrónico"}
            </p>

            {!isAuthenticated && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  💡 <Link href="/auth" className="underline font-medium">Crea una cuenta</Link> para guardar tus direcciones y ver el historial de pedidos
                </p>
              </div>
            )}

            <Link
              href="/productos"
              className="btn-secondary w-full mt-4 block text-center"
            >
              Continuar Comprando
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Anonymous Shipping Form Component
interface AnonymousShippingFormProps {
  onShippingDataChange: (data: AnonymousShippingData | null) => void;
  onPickupSelect: (pickup: boolean) => void;
  pickupSelected: boolean;
  anonymousEmail: string;
  onEmailChange: (email: string) => void;
}

function AnonymousShippingForm({ 
  onShippingDataChange, 
  onPickupSelect, 
  pickupSelected,
  anonymousEmail,
  onEmailChange
}: AnonymousShippingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'México',
    phone: '',
  });

  const calculateShippingCost = (city: string): number => {
    return city.toLowerCase().trim() === 'chihuahua' ? 120 : 200;
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update shipping data if form is complete
    if (newFormData.name && newFormData.address_line1 && newFormData.city && newFormData.state && newFormData.postal_code) {
      onShippingDataChange({
        ...newFormData,
        shipping_cost: calculateShippingCost(newFormData.city),
      });
    } else {
      onShippingDataChange(null);
    }
  };

  const handlePickupToggle = (pickup: boolean) => {
    onPickupSelect(pickup);
    if (pickup) {
      onShippingDataChange(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Información de Envío</h3>
      
      {/* Email Required */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <div className="mb-3">
          <label className="font-medium text-blue-800">
            📧 Correo Electrónico *
          </label>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Te enviaremos la confirmación de tu compra con todos los detalles
        </p>
        <input
          type="email"
          value={anonymousEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="tu@email.com"
          className="input-field"
          required
        />
      </div>

      {/* Pickup Option */}
      <div className="border rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="shipping_option"
            checked={pickupSelected}
            onChange={() => handlePickupToggle(true)}
            className="w-4 h-4 text-primary"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span className="font-medium">Recoger en Tienda</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Gratis</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Ignacio Rodríguez #113, Col. Diego Lucero, Chihuahua, Chih. 31123
            </p>
            <p className="text-xs text-gray-500">
              Disponible de lunes a viernes de 9:00 AM a 6:00 PM
            </p>
          </div>
        </label>
      </div>

      {/* Shipping Option */}
      <div className="border rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="radio"
            name="shipping_option"
            checked={!pickupSelected}
            onChange={() => handlePickupToggle(false)}
            className="w-4 h-4 text-primary"
          />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Envío a Domicilio</span>
          </div>
        </label>

        {!pickupSelected && (
          <div className="space-y-4 ml-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre completo *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field"
                required
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="input-field"
              />
            </div>
            <input
              type="text"
              placeholder="Dirección *"
              value={formData.address_line1}
              onChange={(e) => handleInputChange('address_line1', e.target.value)}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Dirección 2 (opcional)"
              value={formData.address_line2}
              onChange={(e) => handleInputChange('address_line2', e.target.value)}
              className="input-field"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Ciudad *"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Chihuahua: $120 | Otras ciudades: $200
                </p>
              </div>
              <input
                type="text"
                placeholder="Estado *"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Código Postal *"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}