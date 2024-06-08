import { describe, expect, expectTypeOf, test } from "vitest";
import { route } from ".";
import { RouteBuilder } from "./handler/builder";
import { LazyValidator } from "./handler/types";
import { z } from "zod";

describe("route().path", () => {
  test("route Path string aids inference with req.params", () => {
    const _route = route("/user/:id");

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[1];

    expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
      LazyValidator<{ id: string }>
    >();
  });

  test("route Path string inference params is concat w schema", () => {
    const _route = route("/user/:id").params(z.object({ another: z.number() }));

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[1];

    expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
      LazyValidator<{ id: string; another: number }>
    >();
  });

  test("route Path string inference prefers schema type", () => {
    const _route = route("/user/:id").params(z.object({ id: z.number() }));

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[1];

    expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
      LazyValidator<{ id: number }>
    >();
  });

  test("Handles recursively updating Path", () => {
    const r1 = route("/user/:id");
    const r2 = r1.path("/posts/:postId");
    const r3 = r2.path("/articles/:articleId");

    const Path = "/user/:id/posts/:postId/articles/:articleId";

    type R1Path = typeof r1 extends RouteBuilder<infer TParams>
      ? TParams["Path"]
      : never;
    type R2Path = typeof r2 extends RouteBuilder<infer TParams>
      ? TParams["Path"]
      : never;
    type R3Path = typeof r3 extends RouteBuilder<infer TParams>
      ? TParams["Path"]
      : never;

    expectTypeOf<R1Path>().toEqualTypeOf<"/user/:id">();
    expectTypeOf<R2Path>().toEqualTypeOf<"/user/:id/posts/:postId">();
    expectTypeOf<R3Path>().toEqualTypeOf<typeof Path>();

    expect(r1["~def"].path).toEqual("/user/:id");
    expect(r2["~def"].path).toEqual("/user/:id/posts/:postId");
    expect(r3["~def"].path).toEqual(Path);
  });
});
