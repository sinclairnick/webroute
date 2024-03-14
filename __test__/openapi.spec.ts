import express from "express";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { route, registerRoutes, createOpenApiSpec } from "../dist";

describe("Open API", () => {
  test("Works with zod", () => {
    const app = express();

    const routes = [
      route("/a/:params")
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

    console.log(openapi.getSpecAsJson(undefined, 2));

    expect(spec.paths?.["/a/{params}"]).toBeDefined();
    expect(spec.paths?.["/a/{params}"].get).toBeDefined();
    expect(spec.paths?.["/a/{params}"].post).toBeUndefined();
    expect(spec.paths?.["/a/{params}"].get?.requestBody).toBeDefined();
    expect(spec.paths?.["/a/{params}"].get?.responses).toBeDefined();
    expect(spec.paths?.["/a/{params}"].get?.responses?.["200"]).toBeDefined();
    expect(spec.paths?.["/a/{params}"].get?.parameters).toBeDefined();
    expect(spec.paths?.["/a/{params}"].get?.parameters).toHaveLength(2);

    expect(spec.paths?.["/b"]).toBeDefined();
    expect(spec.paths?.["/b"].post).toBeDefined();
    expect(spec.paths?.["/b"].get).toBeUndefined();
    expect(spec.paths?.["/b"].post?.requestBody).toBeUndefined();
    expect(spec.paths?.["/b"].post?.parameters).toHaveLength(0);
  });
});
