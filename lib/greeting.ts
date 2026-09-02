import { Role } from '@/lib/roles'

const GREETINGS: Record<string, string> = {
  USER: 'Bienvenido a FADER',
  STAFF: 'Listo para el club',
  ADMIN: 'Control del club',
}

export function getGreeting(role: Role, name: string | null): string {
  const base = GREETINGS[role] ?? GREETINGS.USER
  return name ? `${base}, ${name}` : base
}

export function getFaderSubtitle(date: Date = new Date()): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('es-ES', { month: 'long' })
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}
