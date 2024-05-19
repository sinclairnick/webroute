import { describe } from "vitest";
import { test } from "vitest";
import { expectTypeOf } from "vitest";
import { generateTestRoutes } from "./test-util";
import { FromWebroutes } from "./from-webroute";
import { InferPaths } from "./infer";

describe("Infer", () => {
  const routes = generateTestRoutes();
  type App = FromWebroutes.InferApp<typeof routes>;

  test("Infers app paths", () => {
    expectTypeOf<App["GET /hello"]>().toBeObject();
    expectTypeOf<App["GET /bye"]>().toBeObject();
  });

  test("Infers method", () => {
    expectTypeOf<App["GET /hello"]>().toBeObject();
    expectTypeOf<App["POST /hello"]>().toBeObject();
  });

  test("Infers query types", () => {
    expectTypeOf<App["GET /hello"]["Query"]>().toEqualTypeOf<{
      hi: number;
    }>();
  });

  test("Infers implicit params types", () => {
    expectTypeOf<
      App["GET /with/implicit/:paramName"]["Params"]
    >().toEqualTypeOf<{
      paramName: string;
    }>();
  });

  test("Infers explicit params types", () => {
    expectTypeOf<
      App["GET /with/explicit/:paramName"]["Params"]
    >().toEqualTypeOf<{
      paramName: number;
    }>();
  });

  test("Infers body types", () => {
    expectTypeOf<App["POST /hello"]["Body"]>().toEqualTypeOf<{
      notHi: number;
    }>();
  });

  test("Infers app path union", () => {
    type Paths = InferPaths<App>;

    expectTypeOf<Paths>().toEqualTypeOf<
      | "/hello"
      | "/bye"
      | "/with/explicit/:paramName"
      | "/with/implicit/:paramName"
    >;
  });

  test("Infers using `endpoint` helper", () => {
    type HelloEndpoint = App["GET /hello"];

    expectTypeOf<HelloEndpoint["Body"]>().toBeUnknown();
    expectTypeOf<HelloEndpoint["Output"]>().toEqualTypeOf<{
      result: boolean;
    }>();
    expectTypeOf<HelloEndpoint["Params"]>().toBeUnknown();
    expectTypeOf<HelloEndpoint["Query"]>().toEqualTypeOf<{ hi: number }>();

    type HelloEndpointPost = App["POST /hello"];
    expectTypeOf<HelloEndpointPost["Body"]>().toEqualTypeOf<{
      notHi: number;
    }>();
    expectTypeOf<HelloEndpointPost["Output"]>().toBeUnknown();
    expectTypeOf<HelloEndpointPost["Params"]>().toBeUnknown();
    expectTypeOf<HelloEndpointPost["Query"]>().toBeUnknown();
  });

  test("Handles multiple routes overloading path", () => {
    expectTypeOf<Extract<keyof App, "GET /hello">>().toBeString();
    expectTypeOf<Extract<keyof App, "POST /hello">>().toBeString();
    expectTypeOf<Extract<keyof App, "PUT /hello">>().toBeNever();
    expectTypeOf<Extract<keyof App, "DELET /hello">>().toBeNever();
  });
});
