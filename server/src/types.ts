import type { Session, User } from 'lucia';

export const roles = [
  'god',
  'admin',
  'hacker',
  'sponsor',
  'volunteer'
] as const;
export type Role = (typeof roles)[number];
export type AccessPermission = Role | 'all' | 'authenticated';

export type Env = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};
