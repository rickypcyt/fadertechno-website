'use server'

import { render } from '@react-email/render'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { requireRole } from '@/lib/permissions'
import { getNextEventTicketsUrl } from '@/lib/newsletter'
import NewsletterEmail from '@/emails/newsletter'

export async function previewNewsletterEmail(subject: string, content: string, image?: string) {
  await requireRole('ADMIN')

  const ticketsUrl = await getNextEventTicketsUrl()

  const html = await render(
    <NewsletterEmail subject={subject} content={content} image={image} ticketsUrl={ticketsUrl} />
  )
  return html
}

export async function sendNewsletter(subject: string, content: string, image?: string) {
  await requireRole('ADMIN')

  if (!subject.trim()) {
    return { error: 'El asunto es obligatorio' }
  }

  if (!content.trim()) {
    return { error: 'El contenido es obligatorio' }
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { subscribed: true },
    select: { email: true },
  })

  if (subscribers.length === 0) {
    return { error: 'No hay suscriptores activos' }
  }

  const ticketsUrl = await getNextEventTicketsUrl()

  const html = await render(
    <NewsletterEmail subject={subject} content={content} image={image} ticketsUrl={ticketsUrl} />
  )

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: subscribers.map((s) => s.email),
    subject,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    return { error: 'No se pudo enviar el newsletter' }
  }

  revalidatePath('/admin/newsletter')
  return { success: true, sent: subscribers.length }
}

export async function sendTestEmail(subject: string, content: string, image?: string) {
  const user = await requireRole('ADMIN')

  if (!subject.trim()) {
    return { error: 'El asunto es obligatorio' }
  }

  if (!content.trim()) {
    return { error: 'El contenido es obligatorio' }
  }

  const ticketsUrl = await getNextEventTicketsUrl()

  const html = await render(
    <NewsletterEmail subject={subject} content={content} image={image} ticketsUrl={ticketsUrl} />
  )

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: `[TEST] ${subject}`,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    return { error: 'No se pudo enviar el email de prueba' }
  }

  return { success: true }
}
