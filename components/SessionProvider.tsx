'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Configurar la persistencia de sesión
    const configureSession = async () => {
      try {
        // Verificar si hay una sesión activa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        // Si hay sesión, asegurar que se mantenga activa
        if (session) {
          // Configurar el refresh automático del token
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
            }
            
            if (event === 'SIGNED_OUT') {
              console.log('User signed out');
            }
          });
        }
      } catch (error) {
        console.error('Error configuring session:', error);
      }
    };

    configureSession();

    // Manejar la visibilidad de la página para mantener la sesión activa
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Cuando la página vuelve a ser visible, verificar la sesión
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error) {
            console.error('Error checking session on visibility change:', error);
          }
          // La sesión se mantendrá automáticamente si es válida
        });
      }
    };

    // Manejar el evento de cambio de foco de la ventana
    const handleFocus = () => {
      // Verificar la sesión cuando la ventana recupera el foco
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error checking session on focus:', error);
        }
      });
    };

    // Manejar el evento beforeunload para mantener la sesión
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // No hacer nada especial, solo permitir que la sesión se mantenga
      // La sesión se guardará automáticamente en localStorage
    };

    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Configurar un intervalo para mantener la sesión activa
    const sessionKeepAlive = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          // La sesión está activa, no necesitamos hacer nada más
          // Supabase maneja automáticamente el refresh del token
        }
      } catch (error) {
        console.error('Error in session keep-alive:', error);
      }
    }, 5 * 60 * 1000); // Verificar cada 5 minutos

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(sessionKeepAlive);
    };
  }, [supabase]);

  return <>{children}</>;
}