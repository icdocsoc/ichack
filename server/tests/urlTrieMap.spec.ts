import { describe, it, expect } from 'bun:test';
import { UrlTrieMap } from '../src/urlTrieMap';

describe('TrieMap', () => {
  it('should set and get values correctly', () => {
    const trieMap = new UrlTrieMap<number>();

    trieMap.set('/auth/users', 1);
    trieMap.set('/auth/signin', 2);
    trieMap.set('/profile/change', 3);

    const users = trieMap.get('/auth/users');
    const signin = trieMap.get('/auth/signin');
    const profile = trieMap.get('/profile/change');
    const team = trieMap.get('/team/create');

    expect(users).toBe(1);
    expect(signin).toBe(2);
    expect(profile).toBe(3);
    expect(team).toBeUndefined();
  });
});
