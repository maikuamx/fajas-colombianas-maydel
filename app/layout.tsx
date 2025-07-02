import { Montserrat } from 'next/font/google';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CartProvider } from '../lib/cart-context';

export const dynamic = 'force-dynamic';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Maydel Fajas Colombianas',
  description: 'Fajas colombianas de alta calidad para realzar tu figura',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

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
    <html lang="es" className={montserrat.variable}>
      <head>
        <script src="https://upload-widget.cloudinary.com/global/all.js" async />
      </head>
      <body className="min-h-screen bg-white flex flex-col">
        <CartProvider initialSession={session}>
          <Navbar session={session} userRole={userRole} />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}