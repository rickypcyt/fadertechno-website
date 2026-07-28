import prisma from '@/lib/prisma'

export async function getNextEventTicketsUrl(): Promise<string | null> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

  const event = await prisma.event.findFirst({
    where: {
      published: true,
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: 'asc' },
    select: { slug: true },
  })

  if (!event) return null

  return `${siteUrl}/evento/${event.slug}`
}
