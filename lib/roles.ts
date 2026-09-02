export enum Role {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export const roleHierarchy: Record<string, number> = {
  [Role.USER]: 0,
  [Role.STAFF]: 1,
  [Role.ADMIN]: 3,
}
