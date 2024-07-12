import { logger } from 'hono/logger';

export const apiLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

export default () => logger(apiLogger);
