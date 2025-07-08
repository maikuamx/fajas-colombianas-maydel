import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import CartPage from '../../components/cart/CartPage';

export const dynamic = 'force-dynamic';

export default async function Cart() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <CartPage isAuthenticated={!!user} />
    </div>
  );
}