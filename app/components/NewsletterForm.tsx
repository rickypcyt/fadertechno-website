'use client'

import { useActionState } from 'react'
import { subscribe } from '@/app/actions/subscribe'

export default function NewsletterForm() {
  const [state, formAction] = useActionState(subscribe, null)

  return (
    <form action={formAction} className="newsletter-form" id="newsletterForm">
      <input
        type="email"
        name="email"
        placeholder="tu@email.com"
        required
      />
      <button type="submit" className="nav-cta">
        Suscribirse
      </button>
      {state?.success && (
        <div className="newsletter-success show">Estás dentro.</div>
      )}
      {state?.error && (
        <div style={{ color: '#ff6b6b', width: '100%' }}>{state.error}</div>
      )}
    </form>
  )
}
