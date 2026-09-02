import Nav from '../components/Nav'
import Hero from '../sections/Hero'
import Manifesto from '../sections/Manifesto'
import Sessions from '../sections/Sessions'
import Artists from '../sections/Artists'
import Historia from '../sections/Historia'
import Archive from '../sections/Archive'
import Editorial from '../sections/Editorial'
import Socials from '../sections/Socials'
import Footer from '../sections/Footer'
import Marquee from '../components/layout/Marquee'
import prisma from '@/lib/prisma'
import { getDictionary, hasLocale, type Locale } from '@/lib/i18n/dictionaries'
import { notFound } from 'next/navigation'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

export const dynamic = 'force-dynamic'

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const now = new Date()
  const upcomingEvents = await prisma.event.findMany({
    where: { published: true, startDate: { gte: now } },
    include: { venue: true, coverImage: true },
    orderBy: { startDate: 'asc' },
    take: 5,
  })

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: 'FADER',
    description: 'Colectivo independiente dedicado al techno y la cultura de club en Alicante.',
    genre: ['Techno', 'Electronic'],
    location: {
      '@type': 'Place',
      name: 'Alicante, España',
    },
    sameAs: [
      'https://www.instagram.com/faderclub',
    ],
  }

  const eventJsonLd = upcomingEvents.map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString(),
    image: event.coverImage?.url,
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.venue.city ?? 'Alicante',
        addressCountry: 'ES',
      },
    },
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {eventJsonLd.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
      <Nav dict={dict} />
      <main className="public-page">
        <Hero dict={dict} />
        <Manifesto dict={dict} />
        <Sessions dict={dict} lang={lang} />
        <Artists dict={dict} />
        <Historia dict={dict} />
        <Archive dict={dict} />
        <Editorial dict={dict} />
        <Socials dict={dict} />
      </main>
      <div style={{ position: 'relative', overflow: 'hidden', height: '160px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <Marquee
          items={['FADER', 'MUSIC', 'CLUB']}
          speed={50}
          opacity={0.4}
        />
      </div>
      <Footer dict={dict} />
    </>
  )
}
