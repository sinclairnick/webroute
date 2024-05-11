import { describe } from "vitest";
import { test } from "vitest";
import { H } from ".";
import { expectTypeOf } from "vitest";
import { generateTestRoutes } from "../internal/test-util";

describe("Infer", () => {
  const routes = generateTestRoutes();
  type App = H.Infer<typeof routes>;

  test("Infers app paths", () => {
    expectTypeOf<App["GET /hello"]>().toBeObject();
    expectTypeOf<App["GET /bye"]>().toBeObject();
  });

  test("Infers method", () => {
    expectTypeOf<App["GET /hello"]>().toBeObject();
    expectTypeOf<App["POST /hello"]>().toBeObject();
  });

  test("Infers query types", () => {
    expectTypeOf<App["GET /hello"]["queryIn"]>().toEqualTypeOf<{
      hi: number;
    }>();
  });

  test("Infers param types", () => {
    expectTypeOf<App["POST /hello"]["bodyIn"]>().toEqualTypeOf<{
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
    type HelloEndpoint = H.Endpoint<App, "GET /hello">;

    expectTypeOf<HelloEndpoint["body"]>().toBeUnknown();
    expectTypeOf<HelloEndpoint["output"]>().toEqualTypeOf<{
      result: boolean;
    }>();
    expectTypeOf<HelloEndpoint["params"]>().toBeUnknown();
    expectTypeOf<HelloEndpoint["query"]>().toEqualTypeOf<{ hi: number }>();

    type HelloEndpointPost = H.Endpoint<App, "POST /hello">;
    expectTypeOf<HelloEndpointPost["body"]>().toEqualTypeOf<{
      notHi: number;
    }>();
    expectTypeOf<HelloEndpointPost["output"]>().toBeUnknown();
    expectTypeOf<HelloEndpointPost["params"]>().toBeUnknown();
    expectTypeOf<HelloEndpointPost["query"]>().toBeUnknown();
  });

  test("Handles multiple routes overloading path", () => {
    expectTypeOf<Extract<keyof App, "GET /hello">>().toBeString();
    expectTypeOf<Extract<keyof App, "POST /hello">>().toBeString();
    expectTypeOf<Extract<keyof App, "PUT /hello">>().toBeNever();
    expectTypeOf<Extract<keyof App, "DELET /hello">>().toBeNever();
  });
});
