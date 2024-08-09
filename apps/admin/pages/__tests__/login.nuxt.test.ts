import { describe, test, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Login from '../login.vue';

describe('Login Page', () => {
  test('Shows error for incorrect formatted email', async () => {
    const page = await mountSuspended(Login);

    const input = page.get('input[type="email"]');
    await input.setValue('nishant');
    const button = page.get('button');
    await button.trigger('click');

    const error = page.find('[data-testid="emailError"]');

    expect(error.text()).toBe('Email must be valid');
  });
});
