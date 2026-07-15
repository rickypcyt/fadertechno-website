export enum Role {
  USER = 'USER',
  STAFF = 'STAFF',
  PROMOTER = 'PROMOTER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const roleHierarchy: Record<string, number> = {
  [Role.USER]: 0,
  [Role.STAFF]: 1,
  [Role.PROMOTER]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPER_ADMIN]: 4,
}
