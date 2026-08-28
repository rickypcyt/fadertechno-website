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

    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    const fallbackTicketsUrl = await getNextEventTicketsUrl()

    const html = await render(
      <WelcomeEmail
        subject={settings?.welcomeEmailSubject ?? undefined}
        content={settings?.welcomeEmailContent ?? undefined}
        ctaText={settings?.welcomeEmailCtaText ?? undefined}
        ctaUrl={settings?.welcomeEmailCtaUrl ?? fallbackTicketsUrl}
        image={settings?.welcomeEmailImage ?? undefined}
      />
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: settings?.welcomeEmailSubject ?? 'Bienvenido a FADER',
      html,
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'No se pudo completar la suscripción' }
  }
}
