'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState } from 'react'
import { subscribe } from '@/app/actions/subscribe'
import { makeNewsletterSchema, type NewsletterValues } from '@/lib/schemas'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function NewsletterForm({ dict }: { dict: Dictionary }) {
  const [state, formAction] = useActionState(subscribe, null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(makeNewsletterSchema(dict.auth.errors)),
    defaultValues: { email: '' },
  })

  return (
    <form action={formAction} className="newsletter-form-wix" id="newsletterForm">
      <div className="newsletter-field">
        <label htmlFor="newsletter-email" className="newsletter-label">
          {dict.editorial.emailLabel} <span className="newsletter-required">{dict.editorial.required}</span>
        </label>
        <input
          id="newsletter-email"
          type="email"
          className="newsletter-input"
          {...register('email')}
        />
        {errors.email && <span className="newsletter-error">{errors.email.message}</span>}
      </div>

      <div className="newsletter-submit-row">
        <button type="submit" className="newsletter-submit">
          {dict.editorial.submit}
        </button>
      </div>

      {state?.success && (
        <div className="newsletter-success show">{dict.editorial.success}</div>
      )}
      {state?.error && (
        <div className="newsletter-error">{dict.editorial.error}</div>
      )}
    </form>
  )
}
