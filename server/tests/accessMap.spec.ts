import { expect, test, describe } from 'bun:test';
import { AccessMap } from '../src/accessMap';

describe('AccessMap', () => {
  test('should add a new permission', () => {
    const accessMap = new AccessMap();

    accessMap.set('GET', '/api/users', 'admin');
    expect(accessMap.get('GET', '/api/users')).toContain('admin');
  });

  test('should add permissions for multiple roles', () => {
    const accessMap = new AccessMap();

    accessMap.set('GET', '/api/users', ['admin', 'volunteer']);
    expect(accessMap.get('GET', '/api/users')).toContain('admin');
    expect(accessMap.get('GET', '/api/users')).toContain('volunteer');
  });

  test('should add all permissions from another accessMap', () => {
    const accessMap = new AccessMap();
    accessMap.set('GET', '/api/users', ['admin', 'volunteer']);

    const otherAccessMap = new AccessMap();
    otherAccessMap.set('POST', '/api/users', 'hacker');

    accessMap.addAll(otherAccessMap);
    expect(accessMap.get('GET', '/api/users')).toContain('admin');
    expect(accessMap.get('GET', '/api/users')).toContain('volunteer');
    expect(accessMap.get('POST', '/api/users')).toContain('hacker');
  });

  test('should add all permissions from another accessMap - 2nd approach', () => {
    const accessMap = new AccessMap();
    accessMap.set('GET', '/api/users', 'admin');
    accessMap.set('GET', '/api/users', 'volunteer');

    const otherAccessMap = new AccessMap();
    otherAccessMap.set('POST', '/api/users', 'hacker');

    accessMap.addAll(otherAccessMap);
    expect(accessMap.get('GET', '/api/users')).toContain('admin');
    expect(accessMap.get('GET', '/api/users')).toContain('volunteer');
    expect(accessMap.get('POST', '/api/users')).toContain('hacker');
  });

  test('should set a base url', () => {
    const accessMap = new AccessMap().baseUrl('/auth');
    accessMap.set('GET', '/users', ['admin', 'volunteer']);

    expect(accessMap.get('GET', '/auth/users')).toContain('admin');
    expect(accessMap.get('GET', '/auth/users')).toContain('volunteer');
  });
});
