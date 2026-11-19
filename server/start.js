/* eslint-env node */
import { createServer } from 'node:http';
import { activityMiddleware } from './activity.js';

const middleware = activityMiddleware({ databasePath: process.env.ACTIVITY_DB, siteOrigin: process.env.SITE_ORIGIN });
createServer((request, response) => middleware(request, response, () => response.writeHead(404).end()))
  .listen(Number(process.env.PORT || 8787));
