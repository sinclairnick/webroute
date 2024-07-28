import { describe, expect, test } from "vitest";
import { route, Route } from "@webroute/route";
import { createLinearRouter, createRadixRouter } from ".";

describe("Webroute", () => {
  test("Works with webroute normalised routes", () => {
    const myRoute = route("/foo")
      .method("get")
      .handle(() => {});

    const normalised = [myRoute].map(Route.normalise);

    const linear = createLinearRouter(normalised);
    const radix = createRadixRouter(normalised);

    const req = new Request("https://a.com/foo", { method: "get" });
    expect(linear.match(req)).toBeDefined();
    expect(radix.match(req)).toBeDefined();
  });
});
