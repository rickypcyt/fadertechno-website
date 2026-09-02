import { Resend } from 'resend'

// Lazy singleton: the Resend client is only constructed on first use, so
// importing this module (e.g. during Next.js build page-data collection)
// does not require RESEND_API_KEY to be set.
let _resend: Resend | null = null

export const resend = new Proxy({} as Resend, {
  get(_target, prop, receiver) {
    if (!_resend) {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        throw new Error(
          'Missing RESEND_API_KEY. Set it in your environment before sending email.'
        )
      }
      _resend = new Resend(apiKey)
    }
    return Reflect.get(_resend, prop, receiver)
  },
})

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'FADER <onboarding@resend.dev>'
