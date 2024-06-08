import { describe, expect, expectTypeOf, test } from "vitest";
import { route } from ".";

describe("route.", () => {
  describe("Methods", () => {
    test("Gets path", () => {
      const r = route("/posts/:id").handle(() => {});
      const path = route.getPath(r);

      expectTypeOf(path).toEqualTypeOf<"/posts/:id">();
      expect(path).toBe("/posts/:id");
    });

    test("Gets single operation", () => {
      const r = route("/posts/:id")
        .method("get")
        .handle(() => {});
      const operations = route.getOperationKeys(r);

      expectTypeOf(operations).toEqualTypeOf<"GET /posts/:id"[]>();
      expect(operations).toEqual(["GET /posts/:id"]);
    });

    test("Gets multiple operations", () => {
      const r = route("/posts/:id")
        .method(["get", "post"])
        .handle(() => {});
      const operations = route.getOperationKeys(r);

      expectTypeOf(operations).toEqualTypeOf<
        ("POST /posts/:id" | "GET /posts/:id")[]
      >();
      expect(operations).toEqual(["GET /posts/:id", "POST /posts/:id"]);
    });

    test("Gets single method", () => {
      const r = route("/posts/:id")
        .method("get")
        .handle(() => {});
      const methods = route.getMethods(r);

      expectTypeOf(methods).toEqualTypeOf<"GET"[]>();
      expect(methods).toEqual(["GET"]);
    });

    test("Gets non-standard method", () => {
      const r = route("/posts/:id")
        .method("custom")
        .handle(() => {});
      const methods = route.getMethods(r);

      expectTypeOf(methods).toEqualTypeOf<"CUSTOM"[]>();
      expect(methods).toEqual(["CUSTOM"]);
    });

    test("Gets multiple methods", () => {
      const r = route("/posts/:id")
        .method(["get", "post"])
        .handle(() => {});
      const methods = route.getMethods(r);

      expectTypeOf(methods).toEqualTypeOf<("GET" | "POST")[]>();
      expect(methods).toEqual(["GET", "POST"]);
    });
  });
});
