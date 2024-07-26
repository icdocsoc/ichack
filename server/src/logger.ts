import type { Context } from 'hono';
import { logger } from 'hono/logger';
import pc from 'picocolors';

enum Level {
  DEBUG = 'D',
  INFO = 'I',
  WARN = 'W',
  ERROR = 'E'
}

export const apiLogger = {
  debug(c: Context, name: string, ...messages: [any, ...any[]]): void {
    const level = Level.DEBUG;

    customLogger(pc.bgBlue(level), [name, ...messages].join(' -- '));
  },
  info(c: Context, name: string, ...messages: [any, ...any[]]): void {
    const level = Level.INFO;

    customLogger(pc.bgWhite(level), [name, ...messages].join(' -- '));
  },
  warn(c: Context, name: string, ...messages: [any, ...any[]]): void {
    const level = Level.WARN;

    customLogger(pc.bgYellow(level), [name, ...messages].join(' -- '));
  },
  error(c: Context, name: string, ...messages: [any, ...any[]]): void {
    const level = Level.ERROR;

    customLogger(pc.bgRed(level), [name, ...messages].join(' -- '));
  }
};

const customLogger = (message: string, ...rest: string[]) => {
  if (Bun.env.NODE_ENV === 'test') {
    return;
  }
  const date = new Date();
  console.log(pc.yellow(date.toISOString()), message, ...rest);
};

export default () => logger(customLogger);
