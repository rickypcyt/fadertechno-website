'use server'

import prisma from '@/lib/prisma'

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

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'No se pudo completar la suscripción' }
  }
}
