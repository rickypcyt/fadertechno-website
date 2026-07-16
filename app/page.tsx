import Nav from './components/Nav'
import Hero from './sections/Hero'
import Manifesto from './sections/Manifesto'
import Sessions from './sections/Sessions'
import Artists from './sections/Artists'
import Historia from './sections/Historia'
import Archive from './sections/Archive'
import Editorial from './sections/Editorial'
import Socials from './sections/Socials'
import Footer from './sections/Footer'
import prisma from '@/lib/prisma'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

export default async function Home() {
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
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Sessions />
        <Artists />
        <Historia />
        <Archive />
        <Editorial />
        <Socials />
      </main>
      <Footer />
    </>
  )
}
