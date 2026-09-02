import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

const locales = { es, en: enUS }

/**
 * Format event date as "Sábado 15 feb" / "Saturday 15 Feb"
 */
export function formatEventDate(date: Date, locale: 'es' | 'en' = 'es'): string {
  const formatted = format(new Date(date), 'EEEE d MMM', { locale: locales[locale] })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Format full date as "15 de febrero de 2026" / "15 February 2026"
 */
export function formatFullDate(date: Date, locale: 'es' | 'en' = 'es'): string {
  const pattern = locale === 'en' ? "d MMMM yyyy" : "d 'de' MMMM 'de' yyyy"
  return format(new Date(date), pattern, { locale: locales[locale] })
}

/**
 * Format short date as "15/02/26"
 */
export function formatShortDate(date: Date, locale: 'es' | 'en' = 'es'): string {
  return format(new Date(date), 'dd/MM/yy', { locale: locales[locale] })
}
