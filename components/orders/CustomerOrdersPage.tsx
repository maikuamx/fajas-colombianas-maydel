'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Calendar, DollarSign, Eye, Truck, CheckCircle, Receipt } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  tax_amount?: number;
  created_at: string;
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
  billing_info: {
    requires_invoice: boolean;
    rfc?: string;
    razon_social?: string;
    cfdi_uso?: string;
  }[] | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    products: {
      id: string;
      name: string;
      image_url: string;
    };
    product_colors?: {
      color_name: string;
      color_code: string;
    } | null;
  }>;
}

interface CustomerOrdersPageProps {
  orders: Order[];
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: Package },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: Package },
];

export default function CustomerOrdersPage({ orders }: CustomerOrdersPageProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
        <p className="text-gray-600">
          Revisa el estado y detalles de tus pedidos
        </p>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap gap-4 items-center">
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
          
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-gray-600">Total Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
              </div>
              <div className="text-gray-600">Total Gastado</div>
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
            const StatusIcon = statusInfo.icon;
            
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
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span>{order.order_items.length} productos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                  </div>
                  {order.shipping_addresses && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{order.shipping_addresses.city}, {order.shipping_addresses.state}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalles
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

              {/* Order Date */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Pedido realizado el {formatDate(selectedOrder.created_at)}</span>
                </div>
              </div>

              {/* Billing Info */}
              {selectedOrder.billing_info && selectedOrder.billing_info.length > 0 && selectedOrder.billing_info[0].requires_invoice && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Información de Facturación
                  </h4>
                  <div className="text-sm space-y-1 bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-800 mb-2">📄 Factura Solicitada</p>
                    <p><span className="font-medium">RFC:</span> {selectedOrder.billing_info[0].rfc}</p>
                    <p><span className="font-medium">Razón Social:</span> {selectedOrder.billing_info[0].razon_social}</p>
                    <p><span className="font-medium">Uso de CFDI:</span> {selectedOrder.billing_info[0].cfdi_uso}</p>
                  </div>
                </div>
              )}
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
                  Productos
                </h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => {
                    const imageUrls = parseImageUrls(item.products.image_url);
                    const firstImage = imageUrls[0] || '';
                    
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={firstImage}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.products.name}</p>
                          {item.product_colors && (
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: item.product_colors.color_code }}
                              />
                              <span className="text-sm text-gray-600">Color: {item.product_colors.color_name}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} × ${item.unit_price}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </div>
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
                    <span>${(selectedOrder.total_amount - selectedOrder.shipping_cost - (selectedOrder.tax_amount || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>${selectedOrder.shipping_cost.toFixed(2)}</span>
                  </div>
                  {selectedOrder.tax_amount && selectedOrder.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>IVA (16%):</span>
                      <span>${selectedOrder.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-3">Estado del Pedido</h5>
                <div className="flex items-center gap-2">
                  {getStatusInfo(selectedOrder.status).icon && (
                    <div className="p-2 rounded-full bg-primary/10">
                      {(() => {
                        const StatusIcon = getStatusInfo(selectedOrder.status).icon;
                        return <StatusIcon className="w-4 h-4 text-primary" />;
                      })()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{getStatusInfo(selectedOrder.status).label}</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.status === 'delivered' && 'Tu pedido ha sido entregado'}
                      {selectedOrder.status === 'shipped' && 'Tu pedido está en camino'}
                      {selectedOrder.status === 'processing' && 'Estamos preparando tu pedido'}
                      {selectedOrder.status === 'pending' && 'Hemos recibido tu pedido'}
                      {selectedOrder.status === 'cancelled' && 'Este pedido ha sido cancelado'}
                    </p>
                  </div>
                </div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">No tienes pedidos aún</h2>
          <p className="text-gray-600 mb-8">
            Cuando realices tu primera compra, aparecerá aquí
          </p>
          <a href="/productos" className="btn-primary">
            Explorar Productos
          </a>
        </motion.div>
      )}
    </div>
  );
}