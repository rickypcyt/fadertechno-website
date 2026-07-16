import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/staff', '/api', '/user'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
