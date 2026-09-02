import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import ProfileForm from '@/app/components/user/ProfileForm'

export default async function UserProfilePage() {
  const user = await requireRole(Role.USER)
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.profile

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  if (!dbUser) return null

  return (
    <div>
      <h1>{t.title}</h1>
      <p className="text-dim">{t.subtitle}</p>

      <div className="admin-card" style={{ marginTop: '32px', maxWidth: '480px' }}>
        <ProfileForm
          user={{
            id: dbUser.id,
            name: dbUser.name ?? '',
            email: dbUser.email,
            role: dbUser.role,
            createdAt: dbUser.createdAt.toISOString(),
          }}
          dict={dict}
        />
      </div>
    </div>
  )
}
