import { type User } from '@shared/types';
import type { Result } from 'typescript-result';
export interface ProfileRepository {
  getUsers(): Promise<Result<User[], Error>>;
  getSelf(): Promise<Result<User, Error>>;
}
