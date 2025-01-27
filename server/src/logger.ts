import type { Context } from 'hono';
import pc from 'picocolors';
import factory from './factory';
import type { Env } from './types';
import type { User } from 'lucia';
import { format } from 'date-fns';

class Level {
  word: string;
  background: (input: string | number | null | undefined) => string;

  private constructor(
    letter: string,
    background: (input: string | number | null | undefined) => string
  ) {
    this.word = letter;
    this.background = background;
  }

  static DEBUG = new Level('DEBUG', pc.bgBlue);
  static INFO = new Level('INFO', pc.bgGreen);
  static WARN = new Level('WARN', pc.bgYellow);
  static ERROR = new Level('ERROR', pc.bgRed);
}

export const apiLogger = {
  debug(c: Context, tag: string, ...messages: string[]): void {
    customLogger(c, Level.DEBUG, tag, messages);
  },
  info(c: Context, tag: string, ...messages: string[]): void {
    customLogger(c, Level.INFO, tag, messages);
  },
  warn(c: Context, tag: string, ...messages: string[]): void {
    customLogger(c, Level.WARN, tag, messages);
  },
  error(c: Context, tag: string, ...messages: string[]): void {
    customLogger(c, Level.ERROR, tag, messages);
  }
};

const customLogger = (
  c: Context<Env>,
  level: Level,
  tag: string,
  messages: string[]
) => {
  if (Bun.env.NODE_ENV == 'test') return;

  const formatUser = (user: User | null): string => {
    if (!user) return '-';

    return `${user.email} (${user.role})`;
  };
  const formatDate = (date: Date): string => {
    return format(date, 'dd/MM/yyyy HH:mm:ss xx');
  };

  const user = c.get('user');
  const date = new Date();
  const { method, path } = c.req;
  const status = c.res.status;

  console.log(
    `${level.background(` ${level.word} `)} [${formatUser(user)}] [${formatDate(date)}] [${tag}] "${method} ${path}" -> ${status}: ${messages.join(' ')}`
  );
};

export default () =>
  factory.createMiddleware(async (c, next) => {
    await next();

    const res = c.res.clone();
    const message = await res.text();
    if (c.res.status >= 500) {
      apiLogger.error(c, 'Response', message);
    } else if (c.res.status >= 400) {
      apiLogger.warn(c, 'Response', message);
    } else apiLogger.info(c, 'Response');
  });
