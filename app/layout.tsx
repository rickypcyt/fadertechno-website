import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientScripts from './components/ClientScripts'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'FADER — Techno contemporáneo',
  description:
    'FADER es un colectivo independiente dedicado al techno y la cultura de club en Alicante.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <ClientScripts />
      </body>
    </html>
  )
}
