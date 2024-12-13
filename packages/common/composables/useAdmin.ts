import { Result } from 'typescript-result';
import type { CreateUserDetails, User, UserCredentials } from '~~/shared/types';

export default () => {
  const deleteUser = (id: string): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const req = await $fetch(`/api/auth/${id}`, {
        method: 'DELETE'
      });

      if (req.error) {
        throw req.error;
      }
    });

  const createUser = (
    details: CreateUserDetails
  ): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const req = await $fetch('/api/auth/create', {
        method: 'POST',
        body: details
      });

      if (req.error) {
        throw req.error;
      }
    });

  return {
    createUser,
    deleteUser
  };
};
