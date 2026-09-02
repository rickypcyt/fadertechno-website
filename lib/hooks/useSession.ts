'use client'

import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { useUserStore } from '@/lib/store'
import { useEffect } from 'react'

interface MeResponse {
  role: 'USER' | 'PROMOTER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'
  name?: string
  email?: string
}

export function useSession() {
  const { setUser, clearUser, isLoggedIn, role, ticketsUrl } = useUserStore()

  const query = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const session = await authClient.getSession()
      if (!session.data) return null

      const res = await fetch('/api/me', { credentials: 'include' })
      if (!res.ok) return null
      const me: MeResponse = await res.json()
      return me
    },
  })

  useEffect(() => {
    if (query.data) {
      setUser({ role: query.data.role, name: query.data.name ?? null, email: query.data.email ?? null })
    } else if (query.data === null && !query.isLoading) {
      clearUser()
    }
  }, [query.data, query.isLoading, setUser, clearUser])

  return { isLoggedIn, role, ticketsUrl, ...query }
}
