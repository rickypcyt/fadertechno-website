'use server'

import { render } from '@react-email/render'
import prisma from '@/lib/prisma'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { getNextEventTicketsUrl } from '@/lib/newsletter'
import WelcomeEmail from '@/emails/welcome'

export async function subscribe(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string | null

  if (!email) {
    return { error: 'Email requerido' }
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { subscribed: true },
      create: { email },
    })

    const ticketsUrl = await getNextEventTicketsUrl()

    const html = await render(<WelcomeEmail ticketsUrl={ticketsUrl} />)

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bienvenido a FADER',
      html,
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'No se pudo completar la suscripción' }
  }
}
