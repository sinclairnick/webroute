import { RequestHandler } from "@hattip/compose";
import { createAdapter } from "..";

export const toHattip = createAdapter<RequestHandler>((c) => {
  return {
    async onData(data) {
      (c as any).state = { ...(c as any).state, ...data };
      c.next();
    },
    async onEmpty() {
      c.next();
    },
    async onResponse(response) {
      return response;
    },
    async onResponseHandler(handler) {
      const res = await c.next();
      return handler(res);
    },
  };
});
