// Please delete this file in the next PR that implements the websocket.

import { beforeAll, describe, expect, test } from 'bun:test';
import { hc } from 'hono/client';
import app from '../src/app';
import { socketEvent } from '../src/testHelpers';

const client = hc<typeof app>('http://localhost:3000');
const ws = client.ws.$ws();

beforeAll(async done => {
  await socketEvent(ws, 'open', _ => done());
});

describe('Websocket example test', () => {
  test('should send a message and receive a response', async () => {
    ws.send('Hello, World!');
    const response = await socketEvent(ws, 'message', evt => {
      return evt.data;
    });

    expect(response).toBe('Thank you for your message. Echo: Hello, World!');
  });
});
