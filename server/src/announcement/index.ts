import { Hono } from 'hono';
import type { Module } from '../module';
import { AccessMap } from '../accessMap';
import routes from './routes';

const accessMap = new AccessMap();

const app = new Hono().basePath('/annoucement').route('/', routes);

export default <Module>{
  accessMap,
  routes: app
};
