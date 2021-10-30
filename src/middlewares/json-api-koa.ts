import { Context, Middleware } from "koa";
import * as koaBody from "koa-body";
import * as compose from "koa-compose";
import Application from "../application";
import ApplicationInstance from "../application-instance";
import {
  authenticate,
  convertErrorToHttpResponse,
  handleBulkEndpoint,
  handleJsonApiEndpoint,
  urlData,
} from "../utils/http-utils";
import jsonApiErrors from "../errors/json-api-errors";
import { TransportLayerOptions } from "../types";

export default function jsonApiKoa(
  app: Application,
  transportLayerOptions: TransportLayerOptions = {
    httpBodyPayload: "1mb",
    httpStrictMode: false,
  },
  ...middlewares: Middleware[]
) {
  const { httpBodyPayload, httpStrictMode } = transportLayerOptions;

  const checkStrictMode = async (ctx: Context, next: () => Promise<any>) => {
    if (!httpStrictMode) {
      return next();
    }

    if (ctx.headers["content-type"] !== "application/vnd.api+json") {
      ctx.status = 400;
      ctx.body = convertErrorToHttpResponse(jsonApiErrors.BadRequest("Content-Type must be application/vnd.api+json"));
    }

    return next();
  };

  const jsonApiKoa = async (ctx: Context, next: () => Promise<any>) => {
    const baseUrl = new URL(`${ctx.request.protocol}://${ctx.request.get("host")}`);
    const appInstance = new ApplicationInstance(app, baseUrl);

    try {
      await authenticate(appInstance, ctx.request);
    } catch (error) {
      ctx.body = convertErrorToHttpResponse(error);
      ctx.status = error.status;
      return next();
    }

    ctx.request["urlData"] = urlData(appInstance, ctx.path);

    if (ctx.method === "PATCH" && ctx.request["urlData"].resource === "bulk") {
      ctx.body = await handleBulkEndpoint(appInstance, ctx.request.body.operations);
      return next();
    }

    try {
      const { body, status } = await handleJsonApiEndpoint(appInstance, ctx.request);
      ctx.body = body;
      ctx.status = status;
    } catch (error) {
      ctx.body = convertErrorToHttpResponse(error);
      ctx.status = error.status;
    } finally {
      return next();
    }
  };

  const koaBodySettings = {
    json: true,
    jsonLimit: httpBodyPayload,
  };

  return compose([checkStrictMode, koaBody(koaBodySettings), ...middlewares, jsonApiKoa]);
}
