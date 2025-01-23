import type { User } from '#shared/types';

export default function useRegistrationUser() {
  const user = useState<User | null>('registration_user', () => null);

  const fetchUserByToken = async (token: string) => {
    const { getRegistrationDetails } = useAuth();

    const { data, error } = await useAsyncData(
      'get_initial_user_data',
      async () => {
        const result = await getRegistrationDetails(token);
        return result.getOrThrow();
      }
    );
    if (error.value) {
      throw error.value;
    }

    user.value = data.value!;
  };

  return {
    user,
    fetchUserByToken
  };
}
