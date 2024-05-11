import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";
import { LazyValidator, route } from ".";
import { HandlerBuilder } from "./handler/builder";

describe("Handler", () => {
  test("Initially has no type info", () => {
    const result = route();

    type TParams = typeof result extends HandlerBuilder<infer TParams>
      ? TParams
      : never;

    expectTypeOf<TParams["_query_out"]>().toEqualTypeOf<unknown>();
    expectTypeOf<TParams["_params_out"]>().toEqualTypeOf<unknown>();
    expectTypeOf<TParams["_body_out"]>().toEqualTypeOf<unknown>();
    expectTypeOf<TParams["_output_out"]>().toEqualTypeOf<unknown>();
  });

  test("Initially has no schema info", () => {
    const result = route();

    expect(result._def.query).toBeUndefined();
    expect(result._def.params).toBeUndefined();
    expect(result._def.body).toBeUndefined();
    expect(result._def.output).toBeUndefined();
  });

  test(".query() adds query param", () => {
    const schema = z.object({ a: z.number() });
    const result = route().query(schema);

    expect(result._def.query).toBeDefined();
    expect(result._def.query?.schema).toEqual(schema);
    expect(result._def.query?.parser({ a: 1 })).resolves.toEqual({ a: 1 });
    expect(() => result._def.query?.parser({ a: "1" })).rejects.toThrow();

    type QueryType = typeof result extends HandlerBuilder<infer TParams>
      ? TParams["_query_out"]
      : never;
    expectTypeOf<QueryType>().toEqualTypeOf<{ a: number }>();
  });

  test(".params() adds params", () => {
    const schema = z.object({ a: z.number() });
    const result = route().params(schema);

    expect(result._def.params).toBeDefined();
    expect(result._def.params?.schema).toEqual(schema);
    expect(result._def.params?.parser({ a: 1 })).resolves.toEqual({ a: 1 });
    expect(() => result._def.params?.parser({ a: "1" })).rejects.toThrow();

    type ParamType = typeof result extends HandlerBuilder<infer TParams>
      ? TParams["_params_out"]
      : never;

    expectTypeOf<ParamType>().toEqualTypeOf<{ a: number }>();
  });

  test(".body() adds body", () => {
    const schema = z.object({ a: z.number() });
    const result = route().body(schema);

    expect(result._def.body).toBeDefined();
    expect(result._def.body?.schema).toEqual(schema);
    expect(result._def.body?.parser({ a: 1 })).resolves.toEqual({ a: 1 });
    expect(() => result._def.body?.parser({ a: "1" })).rejects.toThrow();

    type BodyType = typeof result extends HandlerBuilder<infer TParams>
      ? TParams["_body_out"]
      : never;
    expectTypeOf<BodyType>().toEqualTypeOf<{ a: number }>();
  });

  test(".output() adds output", () => {
    const schema = z.object({ a: z.number().transform((x) => "one") });
    const result = route().output(schema);

    expect(result._def.output).toBeDefined();
    expect(result._def.output?.schema).toEqual(schema);
    expect(result._def.output?.parser({ a: 1 })).resolves.toEqual({ a: "one" });
    expect(() => result._def.output?.parser({ a: "1" })).rejects.toThrow();

    type OutputType = typeof result extends HandlerBuilder<infer TParams>
      ? TParams["_output_in"]
      : never;
    type OutputTypeOut = typeof result extends HandlerBuilder<infer TParams>
      ? TParams["_output_out"]
      : never;

    expectTypeOf<OutputType>().toEqualTypeOf<{ a: number }>();
    expectTypeOf<OutputTypeOut>().not.toEqualTypeOf<{ a: number }>();
  });

  test("handle() returns data as json", async () => {
    const _route = route().handle(async (req) => {
      return { data: true };
    });

    const req = new Request("https://google.com");

    const result = await _route(req);

    expect(await result.json()).toEqual({ data: true });
  });

  test("handle() parses query", async () => {
    const schema = z.object({
      a: z.number({ coerce: true }).transform((x) => `${x}_transformed`),
    });

    let query: any;
    const _route = route()
      .query(schema)
      .handle(async (c) => {
        query = await c.query();
        return null;
      });

    const req = new Request("https://google.com?a=1");
    await _route(req);

    expect(query).toBeDefined();
    expect(query.a).toEqual("1_transformed");
  });

  test("handle() parses params", async () => {
    const schema = z.object({
      a: z.number({ coerce: true }).transform((x) => `${x}_transformed`),
    });

    const _route = route("/:a")
      .params(schema)
      .handle(async (c) => {
        return c.params();
      });

    const req = new Request("https://google.com/1");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toBeDefined();
    expect(data.a).toEqual("1_transformed");
  });

  test("handle() parses body", async () => {
    const schema = z.object({
      a: z.number().transform((x) => `${x}_transformed`),
    });

    const _route = route()
      .body(schema)
      .handle(async (c) => {
        return c.body();
      });

    const req = new Request("https://google.com", {
      body: JSON.stringify({ a: 1 }),
      method: "POST",
    });
    const res = await _route(req);
    const data = await res.json();

    expect(data).toBeDefined();
    expect(data.a).toEqual("1_transformed");
  });

  test("handle() parses output", async () => {
    const schema = z.object({
      a: z.number().transform((x) => `${x}_transformed`),
    });

    const _route = route()
      .output(schema)
      .handle(async () => {
        return { a: 1 };
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toBeDefined();
    expect(data.a).toEqual("1_transformed");
  });

  test("route path string aids inference with req.params", () => {
    const _route = route("/user/:id");

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[0];

    expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
      LazyValidator<{ id: string }>
    >();
  });

  test("route path string inference params is concat w schema", () => {
    const _route = route("/user/:id").params(z.object({ another: z.number() }));

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[0];

    expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
      LazyValidator<{ id: string; another: number }>
    >();
  });

  test("route path string inference prefers schema type", () => {
    const _route = route("/user/:id").params(z.object({ id: z.number() }));

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[0];

    expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
      LazyValidator<{ id: number }>
    >();
  });

  test("Works with .headers", () => {
    const _route = route().headers(z.object({ auth: z.boolean() }));

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[0];

    expectTypeOf<ReqParam["headers"]>().toMatchTypeOf<
      LazyValidator<{ auth: boolean }>
    >();
  });

  test("Parses incoming headers", async () => {
    const schema = z.object({
      a: z.string().transform((x) => `${x}_transformed`),
    });

    const _route = route()
      .headers(schema)
      .handle((c) => {
        return c.headers();
      });

    const headers = new Headers();
    headers.set("a", "a");
    const req = new Request("https://google.com", {
      headers,
    });
    const res = await _route(req);
    const data = await res.json();

    expect(data.a).toBe("a_transformed");
  });

  test("Handles middleware", async () => {
    const _route = route()
      .use((req) => {
        return { id: "123" };
      })
      .handle(({ req, state }) => {
        return state.id;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual("123");
  });

  test("Handles chained middleware", async () => {
    const _route = route()
      .use(() => {
        return { id: "123" };
      })
      .use(({ state }) => {
        expectTypeOf<typeof state>().toEqualTypeOf<{ id: string }>();
        return { id: "456" };
      })
      .handle(({ state }) => {
        return state;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual({ id: "456" });
  });

  test("Handles recursively updating path", () => {
    const r1 = route("/user/:id");
    const r2 = r1.path("/posts/:postId");
    const r3 = r2.path("/articles/:articleId");

    const path = "/user/:id/posts/:postId/articles/:articleId";

    type R1Path = typeof r1 extends HandlerBuilder<infer TParams>
      ? TParams["_path"]
      : never;
    type R2Path = typeof r2 extends HandlerBuilder<infer TParams>
      ? TParams["_path"]
      : never;
    type R3Path = typeof r3 extends HandlerBuilder<infer TParams>
      ? TParams["_path"]
      : never;

    expectTypeOf<R1Path>().toEqualTypeOf<"/user/:id">();
    expectTypeOf<R2Path>().toEqualTypeOf<"/user/:id/posts/:postId">();
    expectTypeOf<R3Path>().toEqualTypeOf<typeof path>();

    expect(r1._def.path).toEqual("/user/:id");
    expect(r2._def.path).toEqual("/user/:id/posts/:postId");
    expect(r3._def.path).toEqual(path);
  });
});
