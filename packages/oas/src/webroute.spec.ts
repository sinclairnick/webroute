import { describe, test, expect } from "vitest";
import { route, normaliseRoutes } from "@webroute/core";
import { createSpec } from "./builder/builder";

describe("Webroute", () => {
  test("Works with normalised routes", () => {
    const myRoute = route("/foo")
      .method("get")
      .handle(() => {});

    const normalised = normaliseRoutes({
      myRoute,
    });

    const spec = createSpec(normalised, {
      formatter: () => ({}),
    }).getSpec();

    expect(spec.paths?.["/foo"].get).toBeDefined();
  });
});
