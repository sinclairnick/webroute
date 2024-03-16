import { describe } from "vitest";
import { test } from "vitest";
import { route } from "../route";
import { H } from ".";
import { expectTypeOf } from "vitest";
import { z } from "zod";

describe("Infer", () => {
  const routes = [
    route("/hello")
      .method("get")
      .query(z.object({ hi: z.number() }))
      .handle(() => {}),
    route("/hello")
      .method("post")
      .body(z.object({ notHi: z.number() }))
      .handle(() => {}),
    route("/bye")
      .params(z.object({ bye: z.number() }))
      .handle(() => {}),
  ] as const;
  type App = H.Infer<typeof routes>;

  test("Infers app paths", () => {
    expectTypeOf<App["/hello"]>().toBeObject();
    expectTypeOf<App["/bye"]>().toBeObject();
  });

  test("Infers method", () => {
    expectTypeOf<App["/hello"]["get"]>().toBeObject();
    expectTypeOf<App["/hello"]["post"]>().toBeObject();
  });

  test("Infers query types", () => {
    expectTypeOf<App["/hello"]["get"]["queryIn"]>().toEqualTypeOf<{
      hi: number;
    }>();
  });

  test("Infers param types", () => {
    expectTypeOf<App["/hello"]["post"]["bodyIn"]>().toEqualTypeOf<{
      notHi: number;
    }>();
  });

  test("Infers app path union", () => {
    type Paths = H.InferPaths<App>;

    expectTypeOf<Paths>().toEqualTypeOf<"/hello" | "/bye">;
  });

  test("Infers using `endpoint` helper", () => {
    type HelloEndpoint = H.Endpoint<App, "/hello", "get">;

    expectTypeOf<HelloEndpoint["body"]>().toBeNever();
    expectTypeOf<HelloEndpoint["output"]>().toBeNever();
    expectTypeOf<HelloEndpoint["params"]>().toBeNever();
    expectTypeOf<HelloEndpoint["query"]>().toEqualTypeOf<{ hi: number }>();

    type HelloEndpointPost = H.Endpoint<App, "/hello", "post">;
    expectTypeOf<HelloEndpointPost["body"]>().toEqualTypeOf<{
      notHi: number;
    }>();
    expectTypeOf<HelloEndpointPost["output"]>().toBeNever();
    expectTypeOf<HelloEndpointPost["params"]>().toBeNever();
    expectTypeOf<HelloEndpointPost["query"]>().toBeNever();
  });

  test("Handles multiple routes overloading path", () => {
    expectTypeOf<App["/hello"]>().toHaveProperty("get");
    expectTypeOf<App["/hello"]>().toHaveProperty("post");
    expectTypeOf<App["/hello"]>().not.toHaveProperty("put");
    expectTypeOf<App["/hello"]>().not.toHaveProperty("delete");
  });
});
