export const roles = [
  'god',
  'admin',
  'hacker',
  'sponsor',
  'volunteer'
] as const;
export type AccessPermission =
  | (typeof roles)[number]
  | 'public'
  | 'authenticated';
