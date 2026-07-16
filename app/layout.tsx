import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientScripts from './components/ClientScripts'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FADER — Techno contemporáneo en Alicante',
    template: '%s · FADER',
  },
  description:
    'FADER es un colectivo independiente dedicado al techno y la cultura de club en Alicante. Eventos, sesiones y experiencias sonoras sin concesiones.',
  keywords: [
    'FADER',
    'techno Alicante',
    'club cultural Alicante',
    'eventos techno',
    'colectivo música electrónica',
    'rave Alicante',
    'Kalicante',
    'cultura de club',
    'música electrónica España',
  ],
  authors: [{ name: 'FADER Collective' }],
  creator: 'FADER Collective',
  publisher: 'FADER Collective',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: 'FADER',
    title: 'FADER — Techno contemporáneo en Alicante',
    description:
      'Colectivo independiente dedicado al techno y la cultura de club en Alicante. Eventos, sesiones y experiencias sonoras.',
    images: [
      {
        url: '/logo.jpeg',
        width: 500,
        height: 500,
        alt: 'FADER logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FADER — Techno contemporáneo en Alicante',
    description:
      'Colectivo independiente. Eventos centrados en el techno, el sonido y la cultura de club.',
    images: ['/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'music',
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
