import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { NextResponse } from 'next/server'
import { locales, defaultLocale, hasLocale } from './lib/i18n/dictionaries'

function getLocale(request: Request): string {
  const headers = Object.fromEntries(request.headers.entries())
  const acceptLanguage = headers['accept-language'] || ''
  const languages = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages()

  return match(languages, locales as unknown as string[], defaultLocale)
}

export function proxy(request: Request) {
  const { pathname } = new URL(request.url)

  // Skip internal paths and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/user') ||
    pathname.includes('.')
  ) {
    return
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect to localized path
  const locale = getLocale(request)
  const newUrl = new URL(request.url)
  newUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ['/((?!_next|api|admin|staff|user|.*\\..*).*)'],
}
