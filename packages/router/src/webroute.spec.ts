import { describe, expect, test } from "vitest";
import { route, normaliseRoutes } from "@webroute/core";
import { createLinearRouter, createRadixRouter } from ".";

describe("Webroute", () => {
  test("Works with webroute normalised routes", () => {
    const myRoute = route("/foo")
      .method("get")
      .handle(() => {});

    const normalised = normaliseRoutes({
      myRoute,
    });

    const linear = createLinearRouter(normalised);
    const radix = createRadixRouter(normalised);

    const req = new Request("https://a.com/foo", { method: "get" });
    expect(linear.match(req)).toBeDefined();
    expect(radix.match(req)).toBeDefined();
  });
});
