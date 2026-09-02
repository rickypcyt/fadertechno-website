import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import RoleSelect from '@/app/components/admin/RoleSelect'

export default async function AdminUsersPage() {
  await requireRole('ADMIN')
  const currentUser = await getCurrentUser()
  if (!currentUser) return null
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.users

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="admin-page">
      <h1>{t.title}</h1>
      <p className="text-dim">{t.summary.replace('{count}', String(users.length))}</p>
      <div className="admin-list" style={{ marginTop: '24px' }}>
        {users.map((u: typeof users[0]) => (
          <div key={u.id} className="admin-list-item">
            <div>
              <div><strong>{u.name ?? dict.panel.common.noName}</strong></div>
              <div className="text-dim" style={{ fontSize: '1rem' }}>{u.email}</div>
              <div className="text-dim" style={{ fontSize: '1rem' }}>
                {new Date(u.createdAt).toLocaleDateString('es-ES')}
              </div>
            </div>
            <RoleSelect user={u} currentUserId={currentUser.id} dict={dict} />
          </div>
        ))}
      </div>
    </div>
  )
}
