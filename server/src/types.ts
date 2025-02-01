import type { Session, User } from 'lucia';

export const roles = ['god', 'admin', 'hacker', 'volunteer'] as const;
export type Role = (typeof roles)[number];
export type AccessPermission = Role | 'all' | 'authenticated';

export const hackspaces = ['jcr', 'qtr', 'scr'] as const;
export type Hackspace = (typeof hackspaces)[number];
export type GrantAccessOptions = {
  allowUnlinkedHackers: boolean;
};

export type Env = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};
