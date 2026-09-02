import { getCurrentUser } from '@/lib/auth'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import VerifyClient from './VerifyClient'

export default async function VerifyPage() {
  const user = await getCurrentUser()
  const dict = await getDictionary(defaultLocale)
  if (!user || !['STAFF', 'ADMIN'].includes(user.role)) {
    return (
      <div className="admin-unauthorized">
        <h1>{dict.panel.unauthorized.title}</h1>
        <p>{dict.panel.unauthorized.generic}</p>
      </div>
    )
  }

  return <VerifyClient dict={dict} />
}
