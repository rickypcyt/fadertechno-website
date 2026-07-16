import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, startDate, endDate, venueName, published, coverUrl, ticketTypes } = body

  if (!title || !description || !startDate || !venueName) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const venueSlug = venueName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const venue = await prisma.venue.upsert({
    where: { slug: venueSlug },
    update: {},
    create: { name: venueName, slug: venueSlug },
  })

  if (!ticketTypes || ticketTypes.length === 0) {
    return Response.json({ error: 'Debe haber al menos un tipo de entrada' }, { status: 400 })
  }

  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

  let coverImageId: string | undefined
  if (coverUrl) {
    const media = await prisma.mediaAsset.create({
      data: { url: coverUrl, type: 'IMAGE', alt: title },
    })
    coverImageId = media.id
  }

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      venueId: venue.id,
      published: published ?? false,
      coverImageId,
      ticketTypes: {
        create: ticketTypes.map((tt: { name: string; price: string; stock: number }) => ({
          name: tt.name,
          price: parseFloat(tt.price),
          stock: parseInt(String(tt.stock)) || 0,
        })),
      },
    },
  })

  return Response.json({ id: event.id, slug: event.slug })
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { eventId, published } = body

  if (!eventId) {
    return Response.json({ error: 'Falta eventId' }, { status: 400 })
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { published },
  })

  return Response.json({ success: true })
}
