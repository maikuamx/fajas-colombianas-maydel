import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import CategoryManagement from '../../../components/admin/CategoryManagement';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <div className="space-y-6">
      <CategoryManagement categories={categories || []} />
    </div>
  );
}