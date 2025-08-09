import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

export async function POST(request: NextRequest) {
  try {
    const orderData: EmailOrderData = await request.json();

    // Read HTML template
    const templatePath = path.join(process.cwd(), 'emails', 'template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Format items for email
    const itemsList = orderData.items.map(item => 
      `<div class="product-item">
        <div class="product-name">${item.name}${item.color_name ? ` (${item.color_name})` : ''}</div>
        <div class="product-details">Cantidad: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</div>
      </div>`
    ).join('');

    // Format shipping address
    let shippingInfo = '';
    if (orderData.isPickup) {
      shippingInfo = `<strong>🏪 RECOGER EN TIENDA</strong><br>
        Dirección: Ignacio Rodríguez #113, Col. Diego Lucero<br>
        Ciudad: Chihuahua, Chihuahua 31123<br>
        País: México<br>
        Teléfono: +52 (614) 371-6816<br>
        Horario: Lunes a Viernes de 9:00 AM a 6:00 PM`;
    } else if (orderData.shippingAddress) {
      const addr = orderData.shippingAddress;
      shippingInfo = `<strong>🚚 ENVÍO A DOMICILIO</strong><br>
        Nombre: ${addr.name}<br>
        Dirección: ${addr.address_line1}${addr.address_line2 ? `, ${addr.address_line2}` : ''}<br>
        Ciudad: ${addr.city}, ${addr.state} ${addr.postal_code}<br>
        País: ${addr.country}${addr.phone ? `<br>Teléfono: ${addr.phone}` : ''}`;
    }

    // Format billing info
    let billingInfo = '';
    if (orderData.billingData?.requires_invoice) {
      const billing = orderData.billingData;
      billingInfo = `<strong>📄 INFORMACIÓN DE FACTURACIÓN</strong><br>
        RFC: ${billing.rfc}<br>
        Razón Social: ${billing.razon_social}<br>
        Uso de CFDI: ${billing.cfdi_uso}<br>
        Nombre: ${billing.full_name}<br>
        Email: ${billing.email}<br>
        Teléfono: ${billing.phone}`;

      if (!billing.same_as_shipping || orderData.isPickup) {
        billingInfo += `<br><strong>Dirección de Facturación:</strong><br>
          ${billing.billing_address_line1}${billing.billing_address_line2 ? `, ${billing.billing_address_line2}` : ''}<br>
          ${billing.billing_city}, ${billing.billing_state} ${billing.billing_postal_code}<br>
          ${billing.billing_country}`;
      }
    } else {
      billingInfo = 'No se requiere factura';
    }

    // Replace template variables
    const replacements = {
      '{{order_number}}': orderData.orderNumber,
      '{{items_list}}': itemsList,
      '{{subtotal}}': (orderData.total - orderData.shippingCost - orderData.taxAmount).toFixed(2),
      '{{shipping_cost}}': orderData.shippingCost.toFixed(2),
      '{{tax_amount}}': orderData.taxAmount.toFixed(2),
      '{{total_amount}}': orderData.total.toFixed(2),
      '{{shipping_info}}': shippingInfo,
      '{{billing_info}}': billingInfo,
      '{{company_name}}': 'Maydel Fajas Colombianas',
      '{{company_phone}}': '+52 (614) 371-6816',
      '{{company_address}}': 'Ignacio Rodríguez #113, Col. Diego Lucero, Chihuahua, Chih. 31123'
    };

    // Apply replacements
    Object.entries(replacements).forEach(([key, value]) => {
      htmlTemplate = htmlTemplate.replace(new RegExp(key, 'g'), value);
    });

    // Configure nodemailer (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });

    // Send email
    const mailOptions = {
      from: `"Maydel Fajas Colombianas" <${process.env.EMAIL_USER}>`,
      to: orderData.email,
      subject: `Confirmación de Compra - Pedido #${orderData.orderNumber}`,
      html: htmlTemplate,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Error sending email', details: error.message },
      { status: 500 }
    );
  }
}