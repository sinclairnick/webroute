import express from "express";
import { discoverRoutes } from "./discover-routes";
import { describe, expect, test } from "vitest";

describe("Discover routes", () => {
  test("Finds routes", () => {
    const app = express();
    app.get("/", () => {});
    app.get("/user", () => {});
    app.post("/user", () => {});
    app.put("/user/:id", () => {});

    const routes = discoverRoutes(app);

    expect(routes).toHaveLength(4);
    for (const route of routes) {
      expect(route.handler).toBeDefined();
      expect(typeof route.handler).toBe("function");
    }
    expect(routes[0].path).toBe("/");
    expect(routes[1].path).toBe("/user");
    expect(routes[2].path).toBe("/user");
    expect(routes[3].path).toBe("/user/:id");
  });
});
