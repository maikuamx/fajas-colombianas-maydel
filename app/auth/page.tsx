import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthForm from '../../components/auth/AuthForm';

export const dynamic = 'force-dynamic';

export default async function AuthPage() {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting session in auth page:', error);
    }
    
    if (user) {
      redirect('/');
    }
  } catch (error) {
    console.error('Error in auth page:', error);
    // Continue to show auth form if there's an error
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}