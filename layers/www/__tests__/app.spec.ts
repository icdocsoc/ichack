import { expect, test } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Page from '../pages/$www/index.vue';

test('Match snapshot', async () => {
  const component = await mountSuspended(Page);
  expect(component.text()).toMatchSnapshot();
});
