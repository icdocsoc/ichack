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
  debug(c: Context, name: string, ...messages: any[]): void {
    const date = new Date();
    const level = Level.DEBUG;

    console.log(
      pc.yellow(date.toUTCString()),
      pc.bgBlue(level),
      name,
      '--',
      messages,
      JSON.stringify(c)
    );
  },
  info(c: Context, name: string, ...messages: any[]): void {
    const date = new Date();
    const level = Level.INFO;

    console.log(
      pc.yellow(date.toUTCString()),
      pc.bgWhite(level),
      name,
      '--',
      messages,
      JSON.stringify(c)
    );
  },
  warn(c: Context, name: string, ...messages: any[]): void {
    const date = new Date();
    const level = Level.WARN;

    console.log(
      pc.yellow(date.toUTCString()),
      pc.bgYellow(level),
      name,
      '--',
      messages,
      JSON.stringify(c)
    );
  },
  error(c: Context, name: string, ...messages: any[]): void {
    const date = new Date();
    const level = Level.ERROR;

    console.log(
      pc.yellow(date.toUTCString()),
      pc.bgRed(level),
      name,
      '--',
      messages,
      JSON.stringify(c)
    );
  }
};

export default () => logger();
