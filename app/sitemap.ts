import type { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

  const events = await prisma.event.findMany({
    where: { published: true },
    select: { slug: true, startDate: true, updatedAt: true },
    orderBy: { startDate: 'desc' },
  })

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/login`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${siteUrl}/user/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticPages, ...eventPages]
}
