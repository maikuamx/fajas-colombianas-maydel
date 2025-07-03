import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminDashboard from '../../components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const [
    { data: products },
    { data: orders },
    { data: profiles }
  ] = await Promise.all([
    supabase.from('products').select('*'),
    supabase
      .from('orders')
      .select(`
        *,
        profiles!inner (
          full_name,
          email
        )
      `),
    supabase.from('profiles').select('*')
  ]);

  console.log('Orders fetched:', orders);
  console.log('Products fetched:', products);
  console.log('Profiles fetched:', profiles);

  return (
    <AdminDashboard
      products={products || []}
      orders={orders || []}
      profiles={profiles || []}
    />
  );
}