import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import SidePanel from '@/app/components/SidePanel'
import MobileNav from '@/app/components/admin/MobileNav'
import { inter, switzer } from '../fonts'
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

  return (
    <html lang="es" className={`${inter.variable} ${switzer.variable}`}>
      <body className={inter.className}>
        <QueryProvider>
          <div className="admin-shell">
            <SidePanel userRole={user.role} />
            <MobileNav brand="FADER" userRole={user.role} userEmail={user.email} />
            <main className="admin-main">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
