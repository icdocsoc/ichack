import type { Env } from 'hono';
import type { Session, User } from 'lucia';

export interface SessionContext extends Env {
  Variables: {
    user: User | null;
    session: Session | null;
  };
}
