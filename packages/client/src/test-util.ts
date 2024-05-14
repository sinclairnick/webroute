import { route } from "@webroute/core";
import { z } from "zod";

export const generateTestRoutes = () => {
  const routes = {
    a: route("/hello")
      .method("get")
      .query(z.object({ hi: z.number() }))
      .output(z.object({ result: z.boolean() }))
      .handle(() => {
        return { result: true };
      }),
    b: route("/hello")
      .method("post")
      .body(z.object({ notHi: z.number() }))
      .handle(() => {}),
    c: route("/bye")
      .method("get")
      .params(z.object({ bye: z.number() }))
      .handle(() => {}),
    d: route("/with/{paramName}")
      .method("get")
      .handle(() => {}),
  };

  return routes;
};
