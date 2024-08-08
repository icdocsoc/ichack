// Extracting out the functions/behaviour that the front end needs from the server
import { type UserCredentials, type UserState } from '@shared/types';
import type { Result } from 'typescript-result';

export interface AuthRepository {
  loginUser(credentials: UserCredentials): Promise<Result<UserState, Error>>;
}
