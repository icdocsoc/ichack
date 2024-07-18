import type { Session, User } from 'lucia';

export type Env = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};
