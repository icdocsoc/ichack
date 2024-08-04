// Extracting out the functions/behaviour that the front end needs from the server
import { type UserCredentials } from '@shared/types';

export interface AuthServer {
  loginUser(credentials: UserCredentials): Promise<Response>;
}
