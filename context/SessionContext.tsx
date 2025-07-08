// context/SessionContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

const SessionContext = createContext<Session | null>(null)

export const useSession = () => useContext(SessionContext)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
