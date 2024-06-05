import { z } from "zod";
import { route } from "../route";

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
    d: route("/with/implicit/:paramName")
      .method("get")
      .handle(() => {}),
    e: route("/with/explicit/:paramName")
      .params(z.object({ paramName: z.number() }))
      .method("get")
      .handle(() => {}),
  };

  return routes;
};
