// Client-safe helper to compute the right "tickets"/home destination based on role
export function getTicketsUrlForRole(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/tickets'
    case 'STAFF':
      return '/staff/dashboard'
    case 'USER':
    default:
      return '/user/tickets'
  }
}
