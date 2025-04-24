import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminDashboard from '../../../components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const [
    { data: products },
    { data: orders },
    { data: profiles }
  ] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('orders').select('*'),
    supabase.from('profiles').select('*')
  ]);

  return (
    <AdminDashboard
      products={products || []}
      orders={orders || []}
      profiles={profiles || []}
    />
  );
}