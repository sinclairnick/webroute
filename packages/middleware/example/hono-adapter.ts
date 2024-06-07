import { MiddlewareHandler } from "hono";
import { createAdapter } from "../src";

export const toHono = createAdapter(
  ([req, next]: Parameters<MiddlewareHandler>) => {
    return {
      onData(data) {
        for (const key in data) {
          req.set(key, data[key]);
        }
        next();
      },
      onEmpty() {
        next();
      },
      onResponse(response) {
        return response;
      },
      async onResponseHandler(handler) {
        await next();
        return handler(req.res);
      },
    };
  }
);
