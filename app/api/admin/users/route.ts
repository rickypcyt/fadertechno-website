import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { userId, role } = await request.json()

  if (!userId || !role) {
    return Response.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const validRoles = ['USER', 'STAFF', 'PROMOTER', 'ADMIN', 'SUPER_ADMIN']
  if (!validRoles.includes(role)) {
    return Response.json({ error: 'Rol inválido' }, { status: 400 })
  }

  if (currentUser.role === 'ADMIN' && role === 'SUPER_ADMIN') {
    return Response.json({ error: 'No puedes asignar SUPER_ADMIN' }, { status: 403 })
  }

  if (userId === currentUser.id) {
    return Response.json({ error: 'No puedes cambiar tu propio rol' }, { status: 403 })
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) {
    return Response.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  if (currentUser.role === 'ADMIN' && targetUser.role === 'SUPER_ADMIN') {
    return Response.json({ error: 'No puedes modificar a SUPER_ADMIN' }, { status: 403 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  return Response.json({ success: true })
}
