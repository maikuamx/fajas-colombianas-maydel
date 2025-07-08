import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { items, total, shipping_address_id, shipping_cost, billing_data, tax_amount } = await request.json();

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        // Product items
        ...items.map((item: any) => ({
          price_data: {
            currency: 'mxn',
            product_data: {
              name: item.name,
              description: item.color_name ? `Color: ${item.color_name}` : undefined,
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })),
        // Shipping cost as a separate line item
        ...(shipping_cost > 0 ? [{
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'Envío',
              description: 'Costo de envío',
            },
            unit_amount: Math.round(shipping_cost * 100),
          },
          quantity: 1,
        }] : []),
        // Tax as a separate line item (if billing is required)
        ...(tax_amount > 0 ? [{
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'IVA (16%)',
              description: 'Impuesto al Valor Agregado',
            },
            unit_amount: Math.round(tax_amount * 100),
          },
          quantity: 1,
        }] : [])
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/carrito`,
      metadata: {
        user_id: user.id,
        items: JSON.stringify(items),
        shipping_address_id: shipping_address_id || '',
        shipping_cost: shipping_cost.toString(),
        billing_data: billing_data ? JSON.stringify(billing_data) : '',
        tax_amount: tax_amount ? tax_amount.toString() : '0',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}