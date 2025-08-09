import emailjs from '@emailjs/browser';

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  color_name?: string;
}

interface EmailOrderData {
  email: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  shippingCost: number;
  taxAmount: number;
  shippingAddress?: any;
  billingData?: any;
  isPickup: boolean;
}

export async function sendOrderConfirmationEmail(orderData: EmailOrderData) {
  try {
    console.log('Sending email to:', orderData.email);
    console.log('Order data:', orderData);

    // Check if EmailJS is configured
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing:', {
        serviceId: !!serviceId,
        templateId: !!templateId,
        publicKey: !!publicKey
      });
      throw new Error('EmailJS configuration is incomplete');
    }

    // Format items for email
    const itemsList = orderData.items.map(item => 
      `• ${item.name}${item.color_name ? ` (${item.color_name})` : ''} - Cantidad: ${item.quantity} - $${item.price.toFixed(2)}`
    ).join('\n');

    // Format shipping address
    let shippingInfo = '';
    if (orderData.isPickup) {
      shippingInfo = `🏪 RECOGER EN TIENDA
Dirección: Ignacio Rodríguez #113, Col. Diego Lucero
Ciudad: Chihuahua, Chihuahua 31123
País: México
Teléfono: +52 (614) 371-6816
Horario: Lunes a Viernes de 9:00 AM a 6:00 PM`;
    } else if (orderData.shippingAddress) {
      const addr = orderData.shippingAddress;
      shippingInfo = `🚚 ENVÍO A DOMICILIO
Nombre: ${addr.name}
Dirección: ${addr.address_line1}${addr.address_line2 ? `, ${addr.address_line2}` : ''}
Ciudad: ${addr.city}, ${addr.state} ${addr.postal_code}
País: ${addr.country}${addr.phone ? `\nTeléfono: ${addr.phone}` : ''}`;
    }

    // Format billing info
    let billingInfo = '';
    if (orderData.billingData?.requires_invoice) {
      const billing = orderData.billingData;
      billingInfo = `📄 INFORMACIÓN DE FACTURACIÓN
RFC: ${billing.rfc}
Razón Social: ${billing.razon_social}
Uso de CFDI: ${billing.cfdi_uso}
Nombre: ${billing.full_name}
Email: ${billing.email}
Teléfono: ${billing.phone}`;

      if (!billing.same_as_shipping || orderData.isPickup) {
        billingInfo += `
Dirección de Facturación:
${billing.billing_address_line1}${billing.billing_address_line2 ? `, ${billing.billing_address_line2}` : ''}
${billing.billing_city}, ${billing.billing_state} ${billing.billing_postal_code}
${billing.billing_country}`;
      }
    } else {
      billingInfo = 'No se requiere factura';
    }

    // Prepare template parameters
    const templateParams = {
      to_email: orderData.email,
      order_number: orderData.orderNumber,
      items_list: itemsList,
      subtotal: (orderData.total - orderData.shippingCost - orderData.taxAmount).toFixed(2),
      shipping_cost: orderData.shippingCost.toFixed(2),
      tax_amount: orderData.taxAmount.toFixed(2),
      total_amount: orderData.total.toFixed(2),
      shipping_info: shippingInfo,
      billing_info: billingInfo,
      company_name: 'Maydel Fajas Colombianas',
      company_phone: '+52 (614) 371-6816',
      company_address: 'Ignacio Rodríguez #113, Col. Diego Lucero, Chihuahua, Chih. 31123'
    };

    console.log('Template params:', templateParams);

    // Send email using EmailJS
    const result = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log('Email sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}