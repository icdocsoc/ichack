import { logger } from 'hono/logger';

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(`[LOG] ${message}`, ...rest);
};

export const apiLogger = () => logger(customLogger);
