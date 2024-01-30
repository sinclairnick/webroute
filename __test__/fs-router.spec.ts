import { test, describe, expect } from "vitest";
import { createFSRouter } from "../src/fs-router";
import { NextJS } from "../src/fs-router/formats/nextjs";
import express from "express";
import { registerRoutes } from "../dist";

describe("FS Router", () => {
  test("Finds the correct routes", () => {
    const router = createFSRouter({
      format: NextJS(),
      rootDir: "./__test__/fixture/routes",
    });

    const meta = router.meta();
    const pathMatches = meta.formattedPaths.map((x) => x.pathMatch);

    expect(pathMatches).includes("/");
    expect(pathMatches).includes("/static");
    expect(pathMatches).includes("/nested");
    expect(pathMatches).includes("/nested/static");
    expect(pathMatches).includes("/nested/:dynamic");
    expect(pathMatches).includes("/nested/nested-again/:catchAll*");
  });

  test("Collects the given modules", async () => {
    const router = createFSRouter({
      format: NextJS(),
      rootDir: "./__test__/fixture/routes",
    });

    const routes = await router.collect();

    expect(routes).toHaveLength(router.meta().formattedPaths.length);
    expect(typeof routes[0]).toBe("function");
    expect(routes[0].call).toBeDefined();
  });

  test("Registers with app", async () => {
    const app = express();
    const router = createFSRouter({
      format: NextJS(),
      rootDir: "./__test__/fixture/routes",
    });

    const routes = await router.collect();

    registerRoutes(app, routes);
  });
});
