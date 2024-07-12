import { createBunWebSocket } from 'hono/bun';

const ws = createBunWebSocket();

export const upgradeWebSocket = ws.upgradeWebSocket;
export const websocket = ws.websocket;
