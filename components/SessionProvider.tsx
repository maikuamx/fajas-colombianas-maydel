'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

const SessionContext = createContext<Session | null>(null)

export function useSession() {
  return useContext(SessionContext)
}

interface SessionProviderProps {
  children: React.ReactNode;
  initialSession?: Session | null;
}

export default function SessionProvider({ children, initialSession = null }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true

    // Set loading to false since we have initial session from server
    setIsLoading(false)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SessionProvider: Auth state changed:', event, session?.user?.id)
        
        if (mounted) {
          setSession(session)
          setIsLoading(false)
        }
        
        // Handle sign out - clear everything and redirect
        if (event === 'SIGNED_OUT') {
          console.log('SessionProvider: User signed out, clearing state')
          if (mounted) {
            setSession(null)
          }
          // Clear any stored data
          localStorage.removeItem('cart_session_id')
          // Small delay to ensure state is cleared
          setTimeout(() => {
            if (window.location.pathname !== '/') {
              window.location.href = '/'
            }
          }, 100)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // Show loading state during initial session check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}