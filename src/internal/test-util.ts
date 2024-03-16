import { z } from "zod";
import { route } from "../route";

export const generateTestRoutes = () => {
  const routes = [
    route("/hello")
      .method("get")
      .query(z.object({ hi: z.number() }))
      .output(z.object({ result: z.boolean() }))
      .handle(() => {}),
    route("/hello")
      .method("post")
      .body(z.object({ notHi: z.number() }))
      .handle(() => {}),
    route("/bye")
      .method("get")
      .params(z.object({ bye: z.number() }))
      .handle(() => {}),
  ] as const;

  return routes;
};
