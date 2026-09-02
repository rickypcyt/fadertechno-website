import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear o actualizar venue Kalicante
  const venue = await prisma.venue.upsert({
    where: { slug: 'kalicante' },
    update: {
      name: 'Kalicante',
      address: 'Alicante',
      city: 'Alicante',
      capacity: 300,
    },
    create: {
      name: 'Kalicante',
      slug: 'kalicante',
      address: 'Alicante',
      city: 'Alicante',
      capacity: 300,
    },
  })

  // Crear o actualizar evento Wilson (14 ago 2026, evento pasado).
  // Horas en UTC para que representen 22:00-06:00 hora de Alicante (CEST, UTC+2):
  //   2026-08-14T20:00:00Z -> 22:00 Alicante
  //   2026-08-15T04:00:00Z -> 06:00 Alicante
  const event = await prisma.event.upsert({
    where: { slug: 'fadermusicclubdiscotecawilson' },
    update: {
      title: 'FADER Music Club Discoteca Wilson',
      description:
        'Próximo evento de FADER. Pronto anunciaremos line-up y fecha definitiva. Una sesión centrada en el techno hipnótico y el dub techno, en un espacio diseñado desde el sonido y la luz.',
      startDate: new Date('2026-08-14T20:00:00Z'),
      endDate: new Date('2026-08-15T04:00:00Z'),
      venueId: venue.id,
      published: true,
    },
    create: {
      title: 'FADER Music Club Discoteca Wilson',
      slug: 'fadermusicclubdiscotecawilson',
      description:
        'Próximo evento de FADER. Pronto anunciaremos line-up y fecha definitiva. Una sesión centrada en el techno hipnótico y el dub techno, en un espacio diseñado desde el sonido y la luz.',
      startDate: new Date('2026-08-14T20:00:00Z'),
      endDate: new Date('2026-08-15T04:00:00Z'),
      venueId: venue.id,
      published: true,
    },
  })

  // Crear o actualizar ticket types.
  // El update no toca `stock` deliberadamente: si ya se han vendido entradas,
  // volver a ejecutar el seed no debe restablecer el stock disponible.
  const earlyBird = await prisma.ticketType.upsert({
    where: { id: 'early-bird-015' },
    update: {
      name: 'Early Bird',
      price: 12,
    },
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
    update: {
      name: 'Preventa',
      price: 18,
    },
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
    update: {
      name: 'Taquilla',
      price: 25,
    },
    create: {
      id: 'door-015',
      name: 'Taquilla',
      price: 25,
      stock: 50,
      eventId: event.id,
    },
  })

  // Artistas invitados del evento Discoteca Wilson.
  // Los residentes (LITN, Cristian Camilo, RUISUK) se muestran en la home;
  // estos son invitados internacionales que aparecen en el line-up del evento.
  const guestArtistNames = ['Audio Units', 'Hexxe', 'Linear System']
  for (const name of guestArtistNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const artist = await prisma.artist.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        resident: false,
      },
    })
    await prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: event.id, artistId: artist.id } },
      update: {},
      create: {
        eventId: event.id,
        artistId: artist.id,
      },
    })
  }

  console.log('Seed completado:')
  console.log(`  Venue: ${venue.name}`)
  console.log(`  Event: ${event.title} (${event.id})`)
  console.log(`  Tickets: ${earlyBird.name} (${earlyBird.stock}), ${presale.name} (${presale.stock}), ${door.name} (${door.stock})`)
  console.log(`  Artistas invitados: ${guestArtistNames.join(', ')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
