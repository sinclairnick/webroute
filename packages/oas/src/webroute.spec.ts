import { describe, test, expect } from "vitest";
import { Route, route } from "@webroute/route";
import { createSpec } from "./builder/builder";

describe("Webroute", () => {
  test("Works with normalised routes", () => {
    const myRoute = route("/foo")
      .method("get")
      .handle(() => {});

    const normalised = [myRoute].map(Route.normalise);

    const spec = createSpec(normalised, {
      formatter: () => ({}),
    }).getSpec();

    expect(spec.paths?.["/foo"].get).toBeDefined();
  });
});
