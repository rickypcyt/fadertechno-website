'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function updateProfile(name: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  if (!name || name.trim().length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres' }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    })
    return { success: true }
  } catch {
    return { error: 'Error al actualizar el perfil' }
  }
}
