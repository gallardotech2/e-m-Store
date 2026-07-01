import type { MetadataRoute } from 'next'

const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteUrl = raw.startsWith('http') ? raw : `https://${raw}`

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/affiliate', '/api'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
