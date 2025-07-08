"use client"

import type React from "react"

import { useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log("SessionProvider: Setting up basic auth listener")

    // Solo escuchar cambios básicos sin intervenir
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("SessionProvider: Auth event", event, !!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <>{children}</>
}
