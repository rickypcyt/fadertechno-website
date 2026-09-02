import { z } from 'zod'

export function makeLoginSchema(errors: { emailInvalid: string; passwordShort: string }) {
  return z.object({
    email: z.string().email(errors.emailInvalid),
    password: z.string().min(8, errors.passwordShort),
  })
}

export function makeRegisterSchema(errors: { emailInvalid: string; passwordShort: string; nameShort: string }) {
  return z.object({
    name: z.string().min(2, errors.nameShort),
    email: z.string().email(errors.emailInvalid),
    password: z.string().min(8, errors.passwordShort),
  })
}

export function makeNewsletterSchema(errors: { emailInvalid: string }) {
  return z.object({
    email: z.string().email(errors.emailInvalid),
  })
}

export type LoginValues = z.infer<ReturnType<typeof makeLoginSchema>>
export type RegisterValues = z.infer<ReturnType<typeof makeRegisterSchema>>
export type NewsletterValues = z.infer<ReturnType<typeof makeNewsletterSchema>>
