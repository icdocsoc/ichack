export const generateRandomString = (length: number): string => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

export const getErrorString = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};
