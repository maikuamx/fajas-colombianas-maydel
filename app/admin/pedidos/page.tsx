import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminOrdersManagement from '../../../components/admin/AdminOrdersManagement';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch orders with all related data
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles!orders_user_id_fkey1 (
        full_name,
        email
      ),
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
      order_items (
        *,
        products (*)
      )
    `)
    .order('created_at', { ascending: false });

  console.log('Orders fetched for admin:', orders);
  console.log('Orders error:', error);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <p className="text-gray-600">Administra todos los pedidos de la tienda</p>
      </div>
      
      <AdminOrdersManagement orders={orders || []} />
    </div>
  );
}