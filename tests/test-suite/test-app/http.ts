import app from "./app";
import * as Koa from "koa";
import * as express from "express";
import { createServer } from "vercel-node-server";
import { jsonApiKoa, jsonApiExpress, jsonApiVercel } from "./kurier";

const faviconMiddleware = async (req, res, next) => {
  if (req.url === "/favicon.ico") {
    res.statusCode = 404;
    res.end();
  } else {
    await next();
  }
};

const koaApp = new Koa();
koaApp.use(async (ctx, next) => faviconMiddleware(ctx.req, ctx.res, next));
koaApp.use(jsonApiKoa(app, { httpStrictMode: true }));

const expressApp = express();
expressApp.use(faviconMiddleware);
expressApp.use(jsonApiExpress(app, { httpStrictMode: true }));

const vercelApp = createServer(jsonApiVercel(app, { httpStrictMode: true }));

export { expressApp, koaApp, vercelApp };
export default koaApp;
