import prisma from '@/lib/prisma'
import SessionsClient from './SessionsClient'

export default async function Sessions() {
  const now = new Date()

  const [upcomingEvent, lastPastEvent] = await Promise.all([
    prisma.event.findFirst({
      where: {
        published: true,
        startDate: { gte: now },
      },
      include: {
        venue: true,
        coverImage: true,
        ticketTypes: true,
        artists: { include: { artist: true } },
      },
      orderBy: { startDate: 'asc' },
    }),
    prisma.event.findFirst({
      where: {
        published: true,
        startDate: { lt: now },
      },
      include: {
        venue: true,
        coverImage: true,
        artists: { include: { artist: true } },
      },
      orderBy: { startDate: 'desc' },
    }),
  ])

  return (
    <SessionsClient
      upcoming={
        upcomingEvent
          ? {
              id: upcomingEvent.id,
              title: upcomingEvent.title,
              slug: upcomingEvent.slug,
              description: upcomingEvent.description,
              startDate: upcomingEvent.startDate,
              venue: { name: upcomingEvent.venue.name, city: upcomingEvent.venue.city },
              coverImage: upcomingEvent.coverImage
                ? { url: upcomingEvent.coverImage.url, alt: upcomingEvent.coverImage.alt }
                : null,
              ticketTypes: upcomingEvent.ticketTypes.map((tt) => ({
                id: tt.id,
                name: tt.name,
                price: tt.price.toString(),
              })),
              artists: upcomingEvent.artists.map((a) => ({ artist: { name: a.artist.name } })),
            }
          : null
      }
      lastPast={
        lastPastEvent
          ? {
              id: lastPastEvent.id,
              title: lastPastEvent.title,
              slug: lastPastEvent.slug,
              description: lastPastEvent.description,
              startDate: lastPastEvent.startDate,
              venue: { name: lastPastEvent.venue.name, city: lastPastEvent.venue.city },
              coverImage: lastPastEvent.coverImage
                ? { url: lastPastEvent.coverImage.url, alt: lastPastEvent.coverImage.alt }
                : null,
              ticketTypes: [],
              artists: lastPastEvent.artists.map((a) => ({ artist: { name: a.artist.name } })),
            }
          : null
      }
    />
  )
}
