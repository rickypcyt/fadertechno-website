'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export default function SignOutButton() {
  const router = useRouter()

  return (
    <button
      className="app-home-navbar-btn"
      onClick={async () => {
        await authClient.signOut()
        router.push('/login')
        router.refresh()
      }}
      aria-label="Cerrar sesión"
    >
      <LogOut size={20} strokeWidth={1.8} />
      <span>Cerrar sesión</span>
    </button>
  )
}
