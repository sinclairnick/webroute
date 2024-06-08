import { MiddlewareHandler } from "hono";
import { createAdapter } from "../src";

export const toHono = createAdapter(
  ([c, next]: Parameters<MiddlewareHandler>) => {
    return {
      onData(data) {
        for (const key in data) {
          c.set(key, data[key]);
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
        return handler(c.res);
      },
    };
  }
);
