import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ProductDetails from '../../../components/products/ProductDetails';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*)
    `)
    .eq('id', params.id)
    .single();

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}