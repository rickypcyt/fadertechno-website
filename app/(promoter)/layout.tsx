import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { inter, switzer } from '../fonts'
import '../globals.css'
import QueryProvider from '../components/QueryProvider'

export default async function PromoterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const allowed = ['PROMOTER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)

  return (
    <html lang="es" className={`${inter.variable} ${switzer.variable}`}>
      <body className={inter.className}>
        <QueryProvider>
          {allowed ? (
            <div className="admin-shell">
              <main className="admin-main">{children}</main>
            </div>
          ) : (
            <div className="admin-unauthorized">
              <h1>403</h1>
              <p>No tienes permisos para acceder al promoter panel.</p>
            </div>
          )}
        </QueryProvider>
      </body>
    </html>
  )
}
