import type { Hono } from 'hono';
import { AccessMap, accessMiddleware } from './accessMap';

export interface Module {
  name: string;
  routes: Hono;
  accessMap: AccessMap;
}

export const installModule = (app: Hono, plugin: Module) => {
  const modulePath = `/${plugin.name}`;
  const actualAccessMap = new AccessMap().baseUrl(modulePath);
  actualAccessMap.addAll(plugin.accessMap);

  // Check if all routes have permissions
  for (const route of plugin.routes.routes) {
    const authorizedRoles = actualAccessMap.get(route.method, route.path);
    if (!authorizedRoles || !authorizedRoles.length) {
      throw new Error(
        `No permissions set for route ${route.method} ${route.path}`
      );
    }
  }

  // add the accessMap middleware
  // Assumes that the sessionMiddleware is already installed
  app.use(accessMiddleware(actualAccessMap));

  // setup the routes
  app.route(modulePath, plugin.routes);
};
