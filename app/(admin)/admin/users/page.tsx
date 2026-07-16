import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import RoleSelect from '@/app/components/admin/RoleSelect'

export default async function AdminUsersPage() {
  await requireRole('ADMIN')
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="admin-page">
      <h1>Usuarios</h1>
      <p className="text-dim">{users.length} usuarios registrados</p>
      <div className="admin-list" style={{ marginTop: '24px' }}>
        {users.map((u: typeof users[0]) => (
          <div key={u.id} className="admin-list-item">
            <div>
              <div><strong>{u.name ?? 'Sin nombre'}</strong></div>
              <div className="text-dim" style={{ fontSize: '0.85rem' }}>{u.email}</div>
              <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                {new Date(u.createdAt).toLocaleDateString('es-ES')}
              </div>
            </div>
            <RoleSelect user={u} currentUserId={currentUser.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
