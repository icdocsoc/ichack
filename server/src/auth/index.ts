import type { Module } from '../module';
import { AccessMap } from '../accessMap';
import routes from './routes';

const accessMap = new AccessMap();

export default <Module>{
  name: 'auth',
  routes,
  accessMap
};
