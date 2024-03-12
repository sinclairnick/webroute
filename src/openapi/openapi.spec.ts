import express from "express";
import { describe, expect, test } from "vitest";
import { registerRoutes, route } from "../route";
import { z } from "zod";
import { createOpenApiSpec } from ".";

describe("Open API", () => {
  test("Works with zod", () => {
    const app = express();

    const routes = [
      route("/a")
        .method("get")
        .query(z.object({ query: z.boolean() }))
        .params(z.object({ params: z.boolean() }))
        .body(z.object({ body: z.boolean() }))
        .output(z.object({ output: z.boolean() }))
        .handle(() => {}),
      route("/b")
        .method("post")
        .handle(() => {}),
    ];

    registerRoutes(app, routes);

    const openapi = createOpenApiSpec(app);

    const spec = openapi.getSpec();

    expect(spec.paths?.["/a"]).toBeDefined();
    expect(spec.paths?.["/a"].get).toBeDefined();
    expect(spec.paths?.["/a"].post).toBeUndefined();
    expect(spec.paths?.["/a"].get?.requestBody).toBeDefined();
    expect(spec.paths?.["/a"].get?.responses).toBeDefined();
    expect(spec.paths?.["/a"].get?.responses?.default).toBeDefined();
    expect(spec.paths?.["/a"].get?.parameters).toBeDefined();
    expect(spec.paths?.["/a"].get?.parameters).toHaveLength(2);

    expect(spec.paths?.["/b"]).toBeDefined();
    expect(spec.paths?.["/b"].post).toBeDefined();
    expect(spec.paths?.["/b"].get).toBeUndefined();
    expect(spec.paths?.["/b"].post?.requestBody).toBeUndefined();
    expect(spec.paths?.["/b"].post?.responses).toBeUndefined();
    expect(spec.paths?.["/b"].post?.parameters).toHaveLength(0);
  });
});
