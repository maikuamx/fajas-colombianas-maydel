'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Building, MapPin, User, Mail, Phone } from 'lucide-react';

interface BillingData {
  requires_invoice: boolean;
  rfc: string;
  razon_social: string;
  cfdi_uso: string;
  full_name: string;
  email: string;
  phone: string;
  same_as_shipping: boolean;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
}

interface BillingFormProps {
  onBillingDataChange: (data: BillingData) => void;
  shippingAddress?: any;
}

const CFDI_OPTIONS = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobilario y equipo de oficina por inversiones' },
  { value: 'I03', label: 'I03 - Equipo de transporte' },
  { value: 'I04', label: 'I04 - Equipo de computo y accesorios' },
  { value: 'I05', label: 'I05 - Dados, troqueles, moldes, matrices y herramental' },
  { value: 'I06', label: 'I06 - Comunicaciones telefónicas' },
  { value: 'I07', label: 'I07 - Comunicaciones satelitales' },
  { value: 'I08', label: 'I08 - Otra maquinaria y equipo' },
  { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
  { value: 'D02', label: 'D02 - Gastos médicos por incapacidad o discapacidad' },
  { value: 'D03', label: 'D03 - Gastos funerales' },
  { value: 'D04', label: 'D04 - Donativos' },
  { value: 'D05', label: 'D05 - Intereses reales efectivamente pagados por créditos hipotecarios' },
  { value: 'D06', label: 'D06 - Aportaciones voluntarias al SAR' },
  { value: 'D07', label: 'D07 - Primas por seguros de gastos médicos' },
  { value: 'D08', label: 'D08 - Gastos de transportación escolar obligatoria' },
  { value: 'D09', label: 'D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
  { value: 'D10', label: 'D10 - Pagos por servicios educativos (colegiaturas)' },
  { value: 'P01', label: 'P01 - Por definir' },
];

export default function BillingForm({ onBillingDataChange, shippingAddress }: BillingFormProps) {
  const [billingData, setBillingData] = useState<BillingData>({
    requires_invoice: false,
    rfc: '',
    razon_social: '',
    cfdi_uso: 'G01',
    full_name: '',
    email: '',
    phone: '',
    same_as_shipping: true,
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: 'México',
  });

  const handleChange = (field: keyof BillingData, value: any) => {
    const newData = { ...billingData, [field]: value };
    
    // If same_as_shipping is true and we have shipping address, copy the data
    if (field === 'same_as_shipping' && value && shippingAddress) {
      newData.billing_address_line1 = shippingAddress.address_line1;
      newData.billing_address_line2 = shippingAddress.address_line2 || '';
      newData.billing_city = shippingAddress.city;
      newData.billing_state = shippingAddress.state;
      newData.billing_postal_code = shippingAddress.postal_code;
      newData.billing_country = shippingAddress.country;
      newData.full_name = shippingAddress.name;
      newData.phone = shippingAddress.phone || '';
    }
    
    setBillingData(newData);
    onBillingDataChange(newData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Información de Facturación</h3>
      </div>

      {/* Require Invoice Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={billingData.requires_invoice}
                onChange={(e) => handleChange('requires_invoice', e.target.checked)}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <div>
                <span className="font-medium">¿Requiere factura?</span>
                <p className="text-sm text-gray-600">
                  Se agregará 16% de IVA al total de su compra
                </p>
              </div>
            </label>
          </div>
          {billingData.requires_invoice && (
            <div className="text-right">
              <span className="text-sm font-medium text-primary">+16% IVA</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {billingData.requires_invoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* RFC and Business Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFC *
                </label>
                <input
                  type="text"
                  value={billingData.rfc}
                  onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="XAXX010101000"
                  maxLength={13}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón Social *
                </label>
                <input
                  type="text"
                  value={billingData.razon_social}
                  onChange={(e) => handleChange('razon_social', e.target.value)}
                  className="input-field"
                  placeholder="Nombre de la empresa o persona física"
                  required
                />
              </div>
            </div>

            {/* CFDI Usage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uso de CFDI *
              </label>
              <select
                value={billingData.cfdi_uso}
                onChange={(e) => handleChange('cfdi_uso', e.target.value)}
                className="input-field"
                required
              >
                {CFDI_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={billingData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Nombre completo"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={billingData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="input-field pl-10"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={billingData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="input-field pl-10"
                  placeholder="55 1234 5678"
                  required
                />
              </div>
            </div>

            {/* Same as Shipping Address */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="same_as_shipping"
                checked={billingData.same_as_shipping}
                onChange={(e) => handleChange('same_as_shipping', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="same_as_shipping" className="ml-2 text-sm text-gray-700">
                Usar la misma dirección de envío para facturación
              </label>
            </div>

            {/* Billing Address (if different from shipping) */}
            <AnimatePresence>
              {!billingData.same_as_shipping && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t pt-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h4 className="font-medium">Dirección de Facturación</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={billingData.billing_address_line1}
                      onChange={(e) => handleChange('billing_address_line1', e.target.value)}
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
                      value={billingData.billing_address_line2}
                      onChange={(e) => handleChange('billing_address_line2', e.target.value)}
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
                        value={billingData.billing_city}
                        onChange={(e) => handleChange('billing_city', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <input
                        type="text"
                        value={billingData.billing_state}
                        onChange={(e) => handleChange('billing_state', e.target.value)}
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
                        value={billingData.billing_postal_code}
                        onChange={(e) => handleChange('billing_postal_code', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}