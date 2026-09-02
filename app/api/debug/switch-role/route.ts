import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@/lib/roles'

export const dynamic = 'force-dynamic'

const ALLOWED_ROLES: Role[] = [
  Role.USER,
  Role.STAFF,
  Role.ADMIN,
]

export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const targetRole = body.role as Role

  if (!ALLOWED_ROLES.includes(targetRole)) {
    return NextResponse.json(
      { error: `Invalid role. Allowed: ${ALLOWED_ROLES.join(', ')}` },
      { status: 400 }
    )
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: targetRole },
    select: { id: true, email: true, name: true, role: true },
  })

  return NextResponse.json(updated)
}
