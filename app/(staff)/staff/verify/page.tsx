import { getCurrentUser } from '@/lib/auth'
import VerifyClient from './VerifyClient'

export default async function VerifyPage() {
  const user = await getCurrentUser()
  if (!user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return (
      <div className="admin-unauthorized">
        <h1>403</h1>
        <p>No tienes permisos para acceder.</p>
      </div>
    )
  }

  return <VerifyClient />
}
