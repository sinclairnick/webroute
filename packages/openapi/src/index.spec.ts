import { route } from "@webroute/core";
import express from "express";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createOpenApiSpec } from "./spec";

describe("Open API", () => {
  test("Works with zod", () => {
    const app = express();

    const routes = [
      route("/a/:id")
        .method("get")
        .query(z.object({ sort: z.boolean() }))
        .params(z.object({ id: z.boolean() }))
        .body(z.object({ name: z.boolean() }))
        .output(z.object({ count: z.number() }))
        .handle(() => {}),
      route("/b")
        .method("post")
        .handle(() => {}),
    ];

    const openapi = createOpenApiSpec(app);

    const spec = openapi.getSpec();

    expect(spec.paths?.["/a/{id}"]).toBeDefined();
    expect(spec.paths?.["/a/{id}"].get).toBeDefined();
    expect(spec.paths?.["/a/{id}"].post).toBeUndefined();
    expect(spec.paths?.["/a/{id}"].get?.requestBody).toBeDefined();
    expect(spec.paths?.["/a/{id}"].get?.responses).toBeDefined();
    expect(spec.paths?.["/a/{id}"].get?.responses?.["200"]).toBeDefined();
    expect(spec.paths?.["/a/{id}"].get?.parameters).toBeDefined();
    expect(spec.paths?.["/a/{id}"].get?.parameters).toHaveLength(2);

    expect(spec.paths?.["/b"]).toBeDefined();
    expect(spec.paths?.["/b"].post).toBeDefined();
    expect(spec.paths?.["/b"].get).toBeUndefined();
    expect(spec.paths?.["/b"].post?.requestBody).toBeUndefined();
    expect(spec.paths?.["/b"].post?.parameters).toHaveLength(0);

    expect(spec.components?.schemas).toBeDefined();
  });

  test("Can overwrite config", () => {
    const app = express();

    const routes = [
      route("/")
        .method("get")
        .meta({
          openApi: (op) => ({}),
        })
        .handle(() => {}),
    ];

    registerRoutes(app, routes);

    const openapi = createOpenApiSpec(app);
    const spec = openapi.getSpec();

    expect(spec.paths?.["/"].get).toBeDefined();
    expect(spec.paths?.["/"].get).toEqual({});
  });

  test("Utilises route name meta", () => {
    const app = express();

    const routes = [
      route("/some-pathname")
        .meta({ name: "MyCustomName" })
        .method("get")
        .handle(() => {}),
    ];

    registerRoutes(app, routes);

    const openApi = createOpenApiSpec(app);

    const spec = openApi.getSpec();

    expect(spec.paths?.["/some-pathname"]).toBeDefined();
    expect(spec.paths?.["/some-pathname"].get).toBeDefined();
    expect(spec.paths?.["/some-pathname"].get?.operationId).toBe(
      "MyCustomName"
    );
  });

  test("Handles param ids in name", () => {
    const app = express();

    const routes = [
      route("/posts/:id/name")
        .method("get")
        .handle(() => {}),
    ];

    registerRoutes(app, routes);

    const openApi = createOpenApiSpec(app);

    const spec = openApi.getSpec();

    expect(spec.paths?.["/posts/{id}/name"]).toBeDefined();
    expect(spec.paths?.["/posts/{id}/name"].get).toBeDefined();
    expect(spec.paths?.["/posts/{id}/name"].get?.operationId).toBe(
      "GetPostsName"
    );
  });

  test("Handles op id uniqueness", () => {
    const app = express();

    const routes = [
      route("/a")
        .method("get")
        .meta({ name: "DuplicateName" })
        .handle(() => {}),
      route("/b")
        .meta({ name: "DuplicateName" })
        .method("get")
        .handle(() => {}),
    ];

    registerRoutes(app, routes);

    const openApi = createOpenApiSpec(app);

    const spec = openApi.getSpec();

    expect(spec.paths?.["/a"].get).toBeDefined();
    expect(spec.paths?.["/a"].get?.operationId).toBe("DuplicateName");
    expect(spec.paths?.["/b"].get).toBeDefined();
    expect(spec.paths?.["/b"].get?.operationId).toBe("DuplicateName1");
  });
});
