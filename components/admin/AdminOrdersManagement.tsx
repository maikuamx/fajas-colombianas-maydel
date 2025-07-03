'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Package, User, MapPin, Calendar, DollarSign, Eye, Edit2, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  shipping_addresses: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    products: {
      id: string;
      name: string;
      image_url: string;
    };
  }>;
}

interface AdminOrdersManagementProps {
  orders: Order[];
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrdersManagement({ orders: initialOrders }: AdminOrdersManagementProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const supabase = createClientComponentClient();

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

  const filteredOrders = statusFilter 
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast.success('Estado del pedido actualizado');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado del pedido');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap gap-6 items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-48"
            >
              <option value="">Todos los estados</option>
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-gray-600">Total Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="text-gray-600">Ingresos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-gray-600">Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Grid */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${
                  selectedOrder?.id === order.id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Pedido #{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{order.profiles?.full_name || 'Usuario desconocido'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span>{order.order_items.length} productos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">${order.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.shipping_addresses && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{order.shipping_addresses.city}, {order.shipping_addresses.state}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, e.target.value);
                    }}
                    disabled={isUpdating}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron pedidos</p>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="text-primary hover:underline mt-2"
                >
                  Ver todos los pedidos
                </button>
              )}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="lg:sticky lg:top-24">
          {selectedOrder ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  Pedido #{selectedOrder.id.slice(0, 8)}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).color}`}>
                  {getStatusInfo(selectedOrder.status).label}
                </span>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información del Cliente
                </h4>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-medium">Nombre:</span> {selectedOrder.profiles?.full_name || 'Usuario desconocido'}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.profiles?.email || 'No disponible'}</p>
                  <p><span className="font-medium">Fecha:</span> {formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_addresses && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Dirección de Envío
                  </h4>
                  <div className="text-sm space-y-1 bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedOrder.shipping_addresses.name}</p>
                    <p>{selectedOrder.shipping_addresses.address_line1}</p>
                    {selectedOrder.shipping_addresses.address_line2 && (
                      <p>{selectedOrder.shipping_addresses.address_line2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_addresses.city}, {selectedOrder.shipping_addresses.state} {selectedOrder.shipping_addresses.postal_code}
                    </p>
                    <p>{selectedOrder.shipping_addresses.country}</p>
                    {selectedOrder.shipping_addresses.phone && (
                      <p>Tel: {selectedOrder.shipping_addresses.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Productos ({selectedOrder.order_items.length})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => {
                    const imageUrls = parseImageUrls(item.products.image_url);
                    const firstImage = imageUrls[0] || '';
                    
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={firstImage}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.products.name}</p>
                          <p className="text-xs text-gray-600">
                            Cantidad: {item.quantity} × ${item.unit_price}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${((selectedOrder.total_amount || 0) - (selectedOrder.shipping_cost || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>${(selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">${(selectedOrder.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cambiar Estado
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  disabled={isUpdating}
                  className="w-full input-field"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {isUpdating && (
                  <p className="text-sm text-gray-500">Actualizando estado...</p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Selecciona un pedido para ver los detalles</p>
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-bold mb-4">No hay pedidos aún</h2>
          <p>Los pedidos aparecerán aquí cuando los clientes realicen compras.</p>
        </div>
      )}
    </div>
  );
}