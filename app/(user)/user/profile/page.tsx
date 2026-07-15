import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import ProfileForm from '@/app/components/user/ProfileForm'

export default async function UserProfilePage() {
  const user = await requireRole(Role.USER)

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  if (!dbUser) return null

  return (
    <div>
      <h1>Perfil</h1>
      <p className="text-dim">Edita tu información personal</p>

      <div className="admin-card" style={{ marginTop: '32px', maxWidth: '480px' }}>
        <ProfileForm
          user={{
            id: dbUser.id,
            name: dbUser.name ?? '',
            email: dbUser.email,
            role: dbUser.role,
            createdAt: dbUser.createdAt.toISOString(),
          }}
        />
      </div>
    </div>
  )
}
