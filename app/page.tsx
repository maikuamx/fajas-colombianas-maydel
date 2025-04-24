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
    { data: { session } },
    { data: products }
  ] = await Promise.all([
    supabase.auth.getSession(),
    supabase
      .from('products')
      .select(`
        *,
        product_colors (*)
      `)
      .limit(6)
  ]);

  let userRole = null;
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    userRole = profile?.role;
  }

  return (
    <div className="flex flex-col gap-16 animate-fadeIn">
      <Hero />
      <FeaturedProducts 
        products={products || []} 
        userRole={userRole}
        isAuthenticated={!!session}
      />
      <Benefits />
      <Testimonials />
    </div>
  );
}