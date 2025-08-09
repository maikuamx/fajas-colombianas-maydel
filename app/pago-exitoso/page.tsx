import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PaymentSuccess from '../../components/payment/PaymentSuccess';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export const dynamic = 'force-dynamic';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!searchParams.session_id) {
    redirect('/carrito');
  }

  try {
    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      searchParams.session_id
    );

    if (checkoutSession.payment_status === 'paid') {
      // Create order in database
      const items = JSON.parse(checkoutSession.metadata?.items || '[]');
      const shippingAddressId = checkoutSession.metadata?.shipping_address_id;
      const shippingCost = parseFloat(checkoutSession.metadata?.shipping_cost || '0');
      const billingData = checkoutSession.metadata?.billing_data ? JSON.parse(checkoutSession.metadata.billing_data) : null;
      const taxAmount = parseFloat(checkoutSession.metadata?.tax_amount || '0');
      const anonymousShipping = checkoutSession.metadata?.anonymous_shipping ? JSON.parse(checkoutSession.metadata.anonymous_shipping) : null;
      const anonymousEmail = checkoutSession.metadata?.anonymous_email;
      
      // Create order data
      const orderData: any = {
        status: 'completed',
        total_amount: checkoutSession.amount_total! / 100, // Convert from cents
        shipping_address_id: shippingAddressId || null,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
      };

      // Add user_id only if user is authenticated
      if (user) {
        (orderData as any).user_id = user.id;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        redirect('/carrito');
      }

      // Create order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        color_id: item.color_id || null,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      // Create billing info if required
      if (billingData && billingData.requires_invoice) {
        const billingInsertData = {
          order_id: order.id,
          ...billingData,
        };

        // Add user_id only if user is authenticated
        if (user) {
          billingInsertData.user_id = user.id;
        }

        const { error: billingError } = await supabase
          .from('billing_info')
          .insert([billingInsertData]);

        if (billingError) {
          console.error('Error creating billing info:', billingError);
        }
      }

      // Clear the cart
      if (user) {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (cart) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);
        }
      }

      // Pass email data to client component
      const emailData = anonymousEmail ? {
        email: anonymousEmail,
        orderNumber: order.id.slice(0, 8),
        items: items,
        total: checkoutSession.amount_total! / 100,
        shippingCost: shippingCost,
        taxAmount: taxAmount,
        shippingAddress: anonymousShipping,
        billingData: billingData,
        isPickup: checkoutSession.metadata?.is_pickup === 'true'
      } : null;

      return <PaymentSuccess orderId={order.id} emailData={emailData} />;
    } else {
      redirect('/carrito');
    }
  } catch (error) {
    console.error('Error processing payment success:', error);
    redirect('/carrito');
  }
}