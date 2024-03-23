import { describe } from "vitest";
import { test } from "vitest";
import { H } from ".";
import { expectTypeOf } from "vitest";
import { generateTestRoutes } from "../internal/test-util";

describe("Infer", () => {
  const routes = generateTestRoutes();
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

    expectTypeOf<Paths>().toEqualTypeOf<
      "/hello" | "/bye" | "/with/{paramName}"
    >;
  });

  test("Infers using `endpoint` helper", () => {
    type HelloEndpoint = H.Endpoint<App, "/hello", "get">;

    expectTypeOf<HelloEndpoint["body"]>().toBeUnknown();
    expectTypeOf<HelloEndpoint["output"]>().toEqualTypeOf<{
      result: boolean;
    }>();
    expectTypeOf<HelloEndpoint["params"]>().toBeUnknown();
    expectTypeOf<HelloEndpoint["query"]>().toEqualTypeOf<{ hi: number }>();

    type HelloEndpointPost = H.Endpoint<App, "/hello", "post">;
    expectTypeOf<HelloEndpointPost["body"]>().toEqualTypeOf<{
      notHi: number;
    }>();
    expectTypeOf<HelloEndpointPost["output"]>().toBeUnknown();
    expectTypeOf<HelloEndpointPost["params"]>().toBeUnknown();
    expectTypeOf<HelloEndpointPost["query"]>().toBeUnknown();
  });

  test("Handles multiple routes overloading path", () => {
    expectTypeOf<App["/hello"]>().toHaveProperty("get");
    expectTypeOf<App["/hello"]>().toHaveProperty("post");
    expectTypeOf<App["/hello"]>().not.toHaveProperty("put");
    expectTypeOf<App["/hello"]>().not.toHaveProperty("delete");
  });
});
