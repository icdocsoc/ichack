import { expect, test } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Page from '../app.vue';

test('Match snapshot', async () => {
  const component = await mountSuspended(Page);
  expect(component.text()).toMatchSnapshot();
});
