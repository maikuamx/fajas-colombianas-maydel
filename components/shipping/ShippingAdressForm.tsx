'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Check, Store } from 'lucide-react';
import { toast } from 'sonner';

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

interface ShippingAddressFormProps {
  onAddressSelect: (address: ShippingAddress) => void;
  selectedAddressId?: string;
}

const PICKUP_ADDRESS: ShippingAddress = {
  id: 'pickup',
  name: 'Recoger en Tienda',
  address_line1: 'Ignacio Rodríguez #113',
  address_line2: 'Col. Diego Lucero',
  city: 'Chihuahua',
  state: 'Chihuahua',
  postal_code: '31123',
  country: 'México',
  phone: '+52 (614) 371-6816',
  is_default: false,
  shipping_cost: 0,
  is_pickup: true,
};

export default function ShippingAddressForm({ onAddressSelect, selectedAddressId }: ShippingAddressFormProps) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'México',
    phone: '',
    is_default: false,
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading addresses:', error);
        throw error;
      }
      
      setAddresses(data || []);
      
      // Auto-select default address or pickup if none selected
      if (!selectedAddressId && data && data.length > 0) {
        const defaultAddress = data.find(addr => addr.is_default) || data[0];
        onAddressSelect(defaultAddress);
      } else if (!selectedAddressId) {
        // If no addresses, auto-select pickup
        onAddressSelect(PICKUP_ADDRESS);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Error al cargar las direcciones');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateShippingCost = (city: string): number => {
    return city.toLowerCase().trim() === 'chihuahua' ? 120 : 200;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      const addressData = {
        ...formData,
        user_id: user.id,
        shipping_cost: calculateShippingCost(formData.city),
      };

      console.log('Saving address data:', addressData);

      if (editingAddress) {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .update(addressData)
          .eq('id', editingAddress.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating address:', error);
          throw error;
        }
        
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id ? data : addr
        ));
        toast.success('Dirección actualizada exitosamente');
      } else {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .insert([addressData])
          .select()
          .single();

        if (error) {
          console.error('Error saving address:', error);
          throw error;
        }
        
        setAddresses(prev => [data, ...prev]);
        toast.success('Dirección agregada exitosamente');
        
        // Auto-select the new address
        onAddressSelect(data);
      }

      setFormData({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'México',
        phone: '',
        is_default: false,
      });
      setShowForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error al guardar la dirección');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: ShippingAddress) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      
      // If deleted address was selected, select pickup
      if (selectedAddressId === id) {
        onAddressSelect(PICKUP_ADDRESS);
      }
      
      toast.success('Dirección eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error al eliminar la dirección');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const allAddresses = [PICKUP_ADDRESS, ...addresses];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dirección de Envío</h3>
        <button
          onClick={() => {
            setEditingAddress(null);
            setFormData({
              name: '',
              address_line1: '',
              address_line2: '',
              city: '',
              state: '',
              postal_code: '',
              country: 'México',
              phone: '',
              is_default: false,
            });
            setShowForm(true);
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Dirección
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-3">
        {allAddresses.map((address) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedAddressId === address.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onAddressSelect(address)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {address.is_pickup ? (
                    <Store className="w-4 h-4 text-primary" />
                  ) : (
                    <MapPin className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium">{address.name}</span>
                  {address.is_pickup && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Gratis
                    </span>
                  )}
                  {address.is_default && (
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                      Por defecto
                    </span>
                  )}
                  {selectedAddressId === address.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {address.address_line1}
                  {address.address_line2 && `, ${address.address_line2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
                {address.phone && (
                  <p className="text-sm text-gray-600">Tel: {address.phone}</p>
                )}
                <p className={`text-sm font-medium mt-2 ${address.shipping_cost === 0 ? 'text-green-600' : 'text-primary'}`}>
                  {address.shipping_cost === 0 ? 'Envío gratuito' : `Costo de envío: $${address.shipping_cost}`}
                </p>
                {address.is_pickup && (
                  <p className="text-xs text-gray-500 mt-1">
                    Disponible de lunes a viernes de 9:00 AM a 6:00 PM
                  </p>
                )}
              </div>
              {!address.is_pickup && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>Puedes recoger en tienda o agregar una dirección de envío</p>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border rounded-lg p-6 bg-gray-50"
        >
          <h4 className="text-lg font-medium mb-4">
            {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                className="input-field"
                placeholder="Calle, número exterior"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección 2 (opcional)
              </label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                className="input-field"
                placeholder="Número interior, colonia, referencias"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Chihuahua: $120 | Otras ciudades: $200
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                Establecer como dirección por defecto
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                }}
                className="btn-secondary flex-1"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary flex-1"
                disabled={isSaving}
              >
                {isSaving 
                  ? 'Guardando...' 
                  : editingAddress 
                    ? 'Actualizar Dirección' 
                    : 'Guardar Dirección'
                }
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}