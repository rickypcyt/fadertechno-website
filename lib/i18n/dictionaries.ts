import 'server-only'
import type { Locale } from './config'

export { locales, defaultLocale } from './config'
export type { Locale } from './config'

const dictionaries = {
  es: () => import('./es.json').then((m) => m.default),
  en: () => import('./en.json').then((m) => m.default),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['es']>>

export function hasLocale(locale: string): locale is Locale {
  return locale in dictionaries
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}
