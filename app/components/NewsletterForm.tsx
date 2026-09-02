'use client'

import { useActionState } from 'react'
import { subscribe } from '@/app/actions/subscribe'

export default function NewsletterForm() {
  const [state, formAction] = useActionState(subscribe, null)

  return (
    <form action={formAction} className="newsletter-form-wix" id="newsletterForm">
      <div className="newsletter-field">
        <label htmlFor="newsletter-email" className="newsletter-label">
          Email <span className="newsletter-required">*</span>
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          aria-label="Email"
          className="newsletter-input"
        />
      </div>

      <div className="newsletter-submit-row">
        <button type="submit" className="newsletter-submit">
          Enviar
        </button>
      </div>

      {state?.success && (
        <div className="newsletter-success show">Estás dentro.</div>
      )}
      {state?.error && (
        <div className="newsletter-error">{state.error}</div>
      )}
    </form>
  )
}
