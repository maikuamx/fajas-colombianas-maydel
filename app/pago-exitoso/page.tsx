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

  if (!user) {
    redirect('/auth');
  }

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
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          status: 'completed',
          total_amount: checkoutSession.amount_total! / 100, // Convert from cents
          shipping_address_id: shippingAddressId || null,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
        }])
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
        const { error: billingError } = await supabase
          .from('billing_info')
          .insert([{
            user_id: user.id,
            order_id: order.id,
            ...billingData,
          }]);

        if (billingError) {
          console.error('Error creating billing info:', billingError);
        }
      }

      // Clear the cart
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

      return <PaymentSuccess orderId={order.id} />;
    } else {
      redirect('/carrito');
    }
  } catch (error) {
    console.error('Error processing payment success:', error);
    redirect('/carrito');
  }
}