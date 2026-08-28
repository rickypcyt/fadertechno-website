'use server'

import { render } from '@react-email/render'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { requireRole } from '@/lib/permissions'
import { getNextEventTicketsUrl } from '@/lib/newsletter'
import WelcomeEmail from '@/emails/welcome'

export type WelcomeEmailConfig = {
  subject: string
  content: string
  ctaText: string
  ctaUrl: string
  image: string
}

export async function getWelcomeEmailConfig(): Promise<WelcomeEmailConfig> {
  await requireRole('ADMIN')

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'main' },
  })

  return {
    subject: settings?.welcomeEmailSubject ?? 'Bienvenido a FADER',
    content:
      settings?.welcomeEmailContent ??
      'Estás dentro. A partir de ahora recibirás información sobre próximos eventos, preventas y anuncios antes que nadie.',
    ctaText: settings?.welcomeEmailCtaText ?? 'Comprar entradas',
    ctaUrl: settings?.welcomeEmailCtaUrl ?? '',
    image: settings?.welcomeEmailImage ?? '',
  }
}

export async function saveWelcomeEmailConfig(
  config: WelcomeEmailConfig
): Promise<{ success?: boolean; error?: string }> {
  await requireRole('ADMIN')

  if (!config.subject.trim()) {
    return { error: 'El asunto es obligatorio' }
  }

  if (!config.content.trim()) {
    return { error: 'El contenido es obligatorio' }
  }

  if (!config.ctaText.trim()) {
    return { error: 'El texto del botón es obligatorio' }
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        welcomeEmailSubject: config.subject,
        welcomeEmailContent: config.content,
        welcomeEmailCtaText: config.ctaText,
        welcomeEmailCtaUrl: config.ctaUrl || null,
        welcomeEmailImage: config.image || null,
      },
      create: {
        id: 'main',
        heroTitle: 'FADER',
        heroDescription: 'Techno contemporáneo en Alicante',
        welcomeEmailSubject: config.subject,
        welcomeEmailContent: config.content,
        welcomeEmailCtaText: config.ctaText,
        welcomeEmailCtaUrl: config.ctaUrl || null,
        welcomeEmailImage: config.image || null,
      },
    })

    revalidatePath('/admin/newsletter')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'No se pudo guardar la configuración' }
  }
}

export async function previewWelcomeEmail(
  config: WelcomeEmailConfig
): Promise<string> {
  await requireRole('ADMIN')

  const fallbackTicketsUrl = await getNextEventTicketsUrl()

  const html = await render(
    <WelcomeEmail
      subject={config.subject}
      content={config.content}
      ctaText={config.ctaText}
      ctaUrl={config.ctaUrl || fallbackTicketsUrl}
      image={config.image || null}
    />
  )
  return html
}

export async function sendWelcomeTestEmail(
  config: WelcomeEmailConfig
): Promise<{ success?: boolean; error?: string }> {
  const user = await requireRole('ADMIN')

  if (!config.subject.trim()) {
    return { error: 'El asunto es obligatorio' }
  }

  if (!config.content.trim()) {
    return { error: 'El contenido es obligatorio' }
  }

  const fallbackTicketsUrl = await getNextEventTicketsUrl()

  const html = await render(
    <WelcomeEmail
      subject={config.subject}
      content={config.content}
      ctaText={config.ctaText}
      ctaUrl={config.ctaUrl || fallbackTicketsUrl}
      image={config.image || null}
    />
  )

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: `[TEST] ${config.subject}`,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    return { error: 'No se pudo enviar el email de prueba' }
  }

  return { success: true }
}
