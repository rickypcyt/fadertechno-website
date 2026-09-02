import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import SidePanel from '@/app/components/SidePanel'
import AdminBackBar from '@/app/components/admin/AdminBackBar'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import '../globals.css'
import QueryProvider from '../components/QueryProvider'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const dict = await getDictionary(defaultLocale)

  return (
    <QueryProvider>
      <I18nProvider dict={dict}>
        <div className="admin-shell">
          <SidePanel userRole={user.role} />
          <main className="admin-main">
            <AdminBackBar role={user.role} />
            {children}
          </main>
        </div>
      </I18nProvider>
    </QueryProvider>
  )
}
