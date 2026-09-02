'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useDict } from '@/lib/i18n/I18nProvider'

export default function SignOutButton() {
  const router = useRouter()
  const dict = useDict()

  return (
    <button
      className="app-home-navbar-btn"
      onClick={async () => {
        await authClient.signOut()
        router.push('/login')
        router.refresh()
      }}
      aria-label={dict.panel.common.signOut}
    >
      <LogOut size={20} strokeWidth={1.8} />
      <span>{dict.panel.common.signOut}</span>
    </button>
  )
}
