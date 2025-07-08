import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CustomerOrdersPage from '../../components/orders/CustomerOrdersPage';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      shipping_addresses (
        name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        phone
      ),
      billing_info (
        requires_invoice,
        rfc,
        razon_social,
        cfdi_uso
      ),
      order_items (
        *,
        products (*),
        product_colors (
          color_name,
          color_code
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomerOrdersPage orders={orders || []} />
    </div>
  );
}