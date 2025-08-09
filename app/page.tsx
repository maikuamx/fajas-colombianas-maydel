import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  const [
    { data: { user } },
    { data: products }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('products')
      .select(`
        *,
        product_colors (*),
        product_sizes (*),
        product_categories (
          categories (*)
        )
      `)
      .limit(6)
  ]);

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    userRole = profile?.role;
  }

  return (
    <div className="flex flex-col gap-16 animate-fadeIn">
      <Hero />
      <FeaturedProducts 
        products={products || []} 
        userRole={userRole}
        isAuthenticated={!!user}
      />
      <Benefits />
      <Testimonials />
    </div>
  );
}