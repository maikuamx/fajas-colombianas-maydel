'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Check } from 'lucide-react';
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
}

interface ShippingAddressFormProps {
  onAddressSelect: (address: ShippingAddress) => void;
  selectedAddressId?: string;
}

export default function ShippingAddressForm({ onAddressSelect, selectedAddressId }: ShippingAddressFormProps) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
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
    
    try {
      const addressData = {
        ...formData,
        shipping_cost: calculateShippingCost(formData.city),
      };

      if (editingAddress) {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .update(addressData)
          .eq('id', editingAddress.id)
          .select()
          .single();

        if (error) throw error;
        
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

        if (error) throw error;
        
        setAddresses(prev => [data, ...prev]);
        toast.success('Dirección agregada exitosamente');
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
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAddresses(prev => prev.filter(addr => addr.id !== id));
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
        {addresses.map((address) => (
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
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{address.name}</span>
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
                <p className="text-sm font-medium text-primary mt-2">
                  Costo de envío: ${address.shipping_cost}
                </p>
              </div>
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
            </div>
          </motion.div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No tienes direcciones guardadas</p>
          <p className="text-sm">Agrega una dirección para continuar</p>
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
                  Nombre completo
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
                Dirección
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
                  Ciudad
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
                  Estado
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
                  Código Postal
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
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary flex-1">
                {editingAddress ? 'Actualizar' : 'Guardar'} Dirección
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}