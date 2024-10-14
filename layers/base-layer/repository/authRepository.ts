// Extracting out the functions/behaviour that the front end needs from the server
import {
  type CreateUserDetails,
  type UserCredentials,
  type User
} from '@shared/types';
import type { Result } from 'typescript-result';

export interface AuthRepository {
  loginUser(credentials: UserCredentials): Promise<Result<User, Error>>;
  createUser(details: CreateUserDetails): Promise<Result<User, Error>>;
  deleteUser(id: string): Promise<Result<void, Error>>; // Returns whether it's successful or not
  logout(): Promise<Result<void, Error>>;
  // editUser(id: string, details: CreateUserDetails) : Promise<Result<UserState, Error>>;
}
