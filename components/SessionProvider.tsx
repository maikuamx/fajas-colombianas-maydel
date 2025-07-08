'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

const SessionContext = createContext<Session | null>(null)

export function useSession() {
  return useContext(SessionContext)
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.setSession({
  access_token: '',
  refresh_token: '',
});

    }
  };

  init();
}, []);


  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
