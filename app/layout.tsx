import type { Metadata } from 'next'
import { inter, switzer } from './fonts'
import './globals.css'
import QueryProvider from './components/QueryProvider'
import RoleSwitcher from './components/admin/RoleSwitcher'

export const metadata: Metadata = {
  title: 'FADER',
  description: 'FADER — Electrónica atemporal en Alicante',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${switzer.variable}`}>
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <RoleSwitcher />
        </QueryProvider>
      </body>
    </html>
  )
}
