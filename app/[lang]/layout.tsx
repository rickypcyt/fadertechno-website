import type { Metadata } from 'next'
import '../globals.css'
import ClientScripts from '../components/ClientScripts'
import VideoBg from '../components/VideoBg'
import QueryProvider from '../components/QueryProvider'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { getDictionary, hasLocale, locales, defaultLocale } from '@/lib/i18n/dictionaries'
import { notFound } from 'next/navigation'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FADER — Electrónica atemporal en Alicante',
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
    title: 'FADER — Electrónica atemporal en Alicante',
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
    title: 'FADER — Electrónica atemporal en Alicante',
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

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <QueryProvider>
      <I18nProvider dict={dict}>
        <VideoBg />
        <div className="video-bg-overlay" />
        <div className="noise-overlay" />
        <div className="cursor-glow" id="cursor-glow" />
        {children}
        <ClientScripts />
      </I18nProvider>
    </QueryProvider>
  )
}
