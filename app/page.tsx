import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .limit(6);

  return (
    <div className="flex flex-col gap-16 animate-fadeIn">
      <Hero />
      <FeaturedProducts products={products || []} />
      <Benefits />
      <Testimonials />
    </div>
  );
}