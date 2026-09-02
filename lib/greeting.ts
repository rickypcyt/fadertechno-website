import { Role } from '@/lib/roles'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export function getGreeting(role: Role, name: string | null, dict: Dictionary): string {
  const base = dict.panel.greeting[role] ?? dict.panel.greeting.USER
  return name ? `${base}, ${name}` : base
}

export function getFaderSubtitle(date: Date = new Date()): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('es-ES', { month: 'long' })
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}
