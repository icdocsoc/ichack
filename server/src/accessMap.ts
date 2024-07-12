import type { Context, Next } from 'hono';
import type { User } from 'lucia';
import { join } from 'node:path/posix';
import type { AccessPermission } from './types';
import { UrlTrieMap } from './urlTrieMap';

/**
 * Represents an access map that maps URLs and HTTP methods to access permissions.
 */
export class AccessMap {
  // Maps HTTP methods to URL trie maps
  // The URL trie maps URLs of the method to access permissions
  private map: Map<string, UrlTrieMap<AccessPermission[]>>;
  private _baseUrl: string;

  /**
   * Creates a new instance of AccessMap.
   */
  constructor() {
    this.map = new Map();
    this._baseUrl = '';
  }

  /**
   * Sets the access permissions for a specific URL and HTTP method.
   * @param method - The HTTP method.
   * @param url - The URL.
   * @param roles - The access permissions.
   */
  public set(method: string, url: string, roles: AccessPermission[]): void;
  public set(method: string, url: string, roles: AccessPermission): void;
  public set(
    method: string,
    url: string,
    roles: AccessPermission | AccessPermission[]
  ): void {
    const actualUrl = join(this._baseUrl, url);
    const actualRoles = Array.isArray(roles) ? roles : [roles];

    const urlTrieMap = this.map.get(method) ?? new UrlTrieMap();
    const exisitingRoles = urlTrieMap.get(actualUrl) || [];
    urlTrieMap.set(actualUrl, [...exisitingRoles, ...actualRoles]);
    this.map.set(method, urlTrieMap);
  }

  /**
   * Gets the access permissions for a specific URL and HTTP method.
   * @param method - The HTTP method.
   * @param url - The URL.
   * @returns The access permissions.
   */
  public get(method: string, url: string): AccessPermission[] {
    const trieMap = this.map.get(method);
    return trieMap?.get(url) || [];
  }

  /**
   * Adds all access permissions from another AccessMap instance to this instance.
   * @param other - The other AccessMap instance.
   */
  public addAll(other: AccessMap) {
    for (const [method, trieMap] of other.map) {
      const existingTrieMap = this.map.get(method);
      if (existingTrieMap) {
        for (const key of trieMap.keys()) {
          const value = trieMap.get(key)!;
          existingTrieMap.set(key, value);
        }
      } else {
        this.map.set(method, trieMap);
      }
    }
  }

  /**
   * Sets the base URL for this AccessMap instance.
   * Any URL passed to the set method **thereafter** will be joined with this base URL.
   * @param url - The base URL.
   * @returns A new AccessMap instance with the updated base URL.
   */
  public baseUrl(url: string): AccessMap {
    const newMap = new AccessMap();
    newMap._baseUrl = url;
    return newMap;
  }
}

/**
 * Middleware function that checks access permissions for a given route.
 * @param accessMap - The access map containing route permissions.
 * @returns A middleware function that checks access permissions and calls the next middleware.
 */
export const accessMiddleware =
  (accessMap: AccessMap) => async (c: Context, next: Next) => {
    const roles = accessMap.get(c.req.method, c.req.path);
    if (!roles.length) {
      // No roles set for this route
      // this means that the route is not found here
      return next();
    }

    if (roles.includes('public')) {
      // The route is set to be public
      return next();
    }

    const user: User | null = c.get('user');
    if (user == null) {
      return c.text(
        `You must be logged in to access ${c.req.method} ${c.req.path}`,
        401
      );
    }
    // The user is authenticated

    if (roles.includes('authenticated') || user.role === 'god') {
      // Allow an authenticated user to access the route
      return next();
    }

    // Restrict access to the route based on the user's role
    if (!roles.includes(user.role)) {
      return c.text(
        `You're a ${user.role} and do not have access to ${c.req.method} ${c.req.path}`,
        403
      );
    }

    // Allow the user to access the route
    return next();
  };
