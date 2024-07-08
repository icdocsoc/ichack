import { logger } from 'hono/logger';

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

export const apiLogger = () => logger(customLogger);
