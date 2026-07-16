import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear o encontrar venue Kalicante
  const venue = await prisma.venue.upsert({
    where: { slug: 'kalicante' },
    update: {},
    create: {
      name: 'Kalicante',
      slug: 'kalicante',
      address: 'Alicante',
      city: 'Alicante',
      capacity: 300,
    },
  })

  // Crear evento TBA
  const event = await prisma.event.upsert({
    where: { slug: 'fader-session-015' },
    update: {
      published: true,
      startDate: new Date('2026-09-27T22:00:00Z'),
    },
    create: {
      title: 'FADER Session 015',
      slug: 'fader-session-015',
      description:
        'Próximo evento de FADER. Pronto anunciaremos line-up y fecha definitiva. Una sesión centrada en el techno hipnótico y el dub techno, en un espacio diseñado desde el sonido y la luz.',
      startDate: new Date('2026-09-27T22:00:00Z'),
      endDate: new Date('2026-09-28T06:00:00Z'),
      venueId: venue.id,
      published: true,
    },
  })

  // Crear ticket types
  const earlyBird = await prisma.ticketType.upsert({
    where: { id: 'early-bird-015' },
    update: {},
    create: {
      id: 'early-bird-015',
      name: 'Early Bird',
      price: 12,
      stock: 50,
      eventId: event.id,
    },
  })

  const presale = await prisma.ticketType.upsert({
    where: { id: 'presale-015' },
    update: {},
    create: {
      id: 'presale-015',
      name: 'Preventa',
      price: 18,
      stock: 100,
      eventId: event.id,
    },
  })

  const door = await prisma.ticketType.upsert({
    where: { id: 'door-015' },
    update: {},
    create: {
      id: 'door-015',
      name: 'Taquilla',
      price: 25,
      stock: 50,
      eventId: event.id,
    },
  })

  console.log('Seed completado:')
  console.log(`  Venue: ${venue.name}`)
  console.log(`  Event: ${event.title} (${event.id})`)
  console.log(`  Tickets: ${earlyBird.name} (${earlyBird.stock}), ${presale.name} (${presale.stock}), ${door.name} (${door.stock})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
