import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ProductCatalog from '../../components/products/ProductCatalog';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*)
    `);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductCatalog products={products || []} />
    </div>
  );
}