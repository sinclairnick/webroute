import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";
import { LazyValidator, route } from ".";
import { HandlerBuilder } from "./handler/builder";

describe("Route()", () => {
  describe("Schema", () => {
    test("Initially has no type info", () => {
      const result = route();

      type TParams = typeof result extends HandlerBuilder<infer TParams>
        ? TParams
        : never;

      expectTypeOf<TParams["QueryOut"]>().toEqualTypeOf<unknown>();
      expectTypeOf<TParams["ParamsOut"]>().toEqualTypeOf<unknown>();
      expectTypeOf<TParams["BodyOut"]>().toEqualTypeOf<unknown>();
      expectTypeOf<TParams["OutputOut"]>().toEqualTypeOf<unknown>();
    });

    test("Initially has no schema info", () => {
      const result = route();

      expect(result["~def"].query).toBeUndefined();
      expect(result["~def"].params).toBeUndefined();
      expect(result["~def"].body).toBeUndefined();
      expect(result["~def"].output).toBeUndefined();
    });

    test(".query() adds query param", () => {
      const schema = z.object({ a: z.number() });
      const result = route().query(schema);

      expect(result["~def"].query).toBeDefined();
      expect(result["~def"].query?.schema).toEqual(schema);
      expect(result["~def"].query?.parser({ a: 1 })).resolves.toEqual({ a: 1 });
      expect(() => result["~def"].query?.parser({ a: "1" })).rejects.toThrow();

      type QueryType = typeof result extends HandlerBuilder<infer TParams>
        ? TParams["QueryOut"]
        : never;
      expectTypeOf<QueryType>().toEqualTypeOf<{ a: number }>();
    });

    test(".params() adds params", () => {
      const schema = z.object({ a: z.number() });
      const result = route().params(schema);

      expect(result["~def"].params).toBeDefined();
      expect(result["~def"].params?.schema).toEqual(schema);
      expect(result["~def"].params?.parser({ a: 1 })).resolves.toEqual({
        a: 1,
      });
      expect(() => result["~def"].params?.parser({ a: "1" })).rejects.toThrow();

      type ParamType = typeof result extends HandlerBuilder<infer TParams>
        ? TParams["ParamsOut"]
        : never;

      expectTypeOf<ParamType>().toEqualTypeOf<{ a: number }>();
    });

    test(".body() adds body", () => {
      const schema = z.object({ a: z.number() });
      const result = route().body(schema);

      expect(result["~def"].body).toBeDefined();
      expect(result["~def"].body?.schema).toEqual(schema);
      expect(result["~def"].body?.parser({ a: 1 })).resolves.toEqual({ a: 1 });
      expect(() => result["~def"].body?.parser({ a: "1" })).rejects.toThrow();

      type BodyType = typeof result extends HandlerBuilder<infer TParams>
        ? TParams["BodyOut"]
        : never;
      expectTypeOf<BodyType>().toEqualTypeOf<{ a: number }>();
    });

    test(".headers() adds header", () => {
      const schema = z.object({ a: z.number() });
      const result = route().headers(schema);

      expect(result["~def"].headersReq).toBeDefined();
      expect(result["~def"].headersReq?.schema).toEqual(schema);
      expect(result["~def"].headersReq?.parser({ a: 1 })).resolves.toEqual({
        a: 1,
      });
      expect(() =>
        result["~def"].headersReq?.parser({ a: "1" })
      ).rejects.toThrow();

      type BodyType = typeof result extends HandlerBuilder<infer TParams>
        ? TParams["HeadersReqOut"]
        : never;
      expectTypeOf<BodyType>().toEqualTypeOf<{ a: number }>();
    });

    test(".output() adds output", () => {
      const schema = z.object({ a: z.number().transform((x) => "one") });
      const result = route().output(schema);

      expect(result["~def"].output).toBeDefined();
      expect(result["~def"].output?.schema).toEqual(schema);
      expect(result["~def"].output?.parser({ a: 1 })).resolves.toEqual({
        a: "one",
      });
      expect(() => result["~def"].output?.parser({ a: "1" })).rejects.toThrow();

      type OutputType = typeof result extends HandlerBuilder<infer TParams>
        ? TParams["OutputIn"]
        : never;
      type OutputTypeOut = typeof result extends HandlerBuilder<infer TParams>
        ? TParams["OutputOut"]
        : never;

      expectTypeOf<OutputType>().toEqualTypeOf<{ a: number }>();
      expectTypeOf<OutputTypeOut>().not.toEqualTypeOf<{ a: number }>();
    });

    test("Works with .headers", () => {
      const _route = route().headers(z.object({ auth: z.boolean() }));

      type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
      type ReqParam = Parameters<HandlerFn>[0];

      expectTypeOf<ReqParam["headers"]>().toMatchTypeOf<
        LazyValidator<{ auth: boolean }>
      >();
    });
  });

  describe("Path", () => {
    test("route Path string aids inference with req.params", () => {
      const _route = route("/user/:id");

      type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
      type ReqParam = Parameters<HandlerFn>[0];

      expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
        LazyValidator<{ id: string }>
      >();
    });

    test("route Path string inference params is concat w schema", () => {
      const _route = route("/user/:id").params(
        z.object({ another: z.number() })
      );

      type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
      type ReqParam = Parameters<HandlerFn>[0];

      expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
        LazyValidator<{ id: string; another: number }>
      >();
    });

    test("route Path string inference prefers schema type", () => {
      const _route = route("/user/:id").params(z.object({ id: z.number() }));

      type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
      type ReqParam = Parameters<HandlerFn>[0];

      expectTypeOf<ReqParam["params"]>().toEqualTypeOf<
        LazyValidator<{ id: number }>
      >();
    });

    test("Handles recursively updating Path", () => {
      const r1 = route("/user/:id");
      const r2 = r1.path("/posts/:postId");
      const r3 = r2.path("/articles/:articleId");

      const Path = "/user/:id/posts/:postId/articles/:articleId";

      type R1Path = typeof r1 extends HandlerBuilder<infer TParams>
        ? TParams["Path"]
        : never;
      type R2Path = typeof r2 extends HandlerBuilder<infer TParams>
        ? TParams["Path"]
        : never;
      type R3Path = typeof r3 extends HandlerBuilder<infer TParams>
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

  describe("Execution", () => {
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

  describe("Middleware", () => {
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
  });
});

describe("Route.", () => {
  describe("Methods", () => {
    test("Gets path", () => {
      const r = route("/posts/:id").handle(() => {});
      const path = route.getPath(r);

      expectTypeOf(path).toEqualTypeOf<"/posts/:id">();
      expect(path).toBe("/posts/:id");
    });

    test("Gets single operation", () => {
      const r = route("/posts/:id")
        .method("get")
        .handle(() => {});
      const operations = route.getOperations(r);

      expectTypeOf(operations).toEqualTypeOf<"GET /posts/:id"[]>();
      expect(operations).toEqual(["GET /posts/:id"]);
    });

    test("Gets multiple operations", () => {
      const r = route("/posts/:id")
        .method(["get", "post"])
        .handle(() => {});
      const operations = route.getOperations(r);

      expectTypeOf(operations).toEqualTypeOf<
        ("POST /posts/:id" | "GET /posts/:id")[]
      >();
      expect(operations).toEqual(["GET /posts/:id", "POST /posts/:id"]);
    });

    test("Gets single method", () => {
      const r = route("/posts/:id")
        .method("get")
        .handle(() => {});
      const methods = route.getMethods(r);

      expectTypeOf(methods).toEqualTypeOf<"get"[]>();
      expect(methods).toEqual(["get"]);
    });

    test("Gets non-standard method", () => {
      const r = route("/posts/:id")
        .method("custom")
        .handle(() => {});
      const methods = route.getMethods(r);

      expectTypeOf(methods).toEqualTypeOf<"custom"[]>();
      expect(methods).toEqual(["custom"]);
    });

    test("Gets multiple methods", () => {
      const r = route("/posts/:id")
        .method(["get", "post"])
        .handle(() => {});
      const methods = route.getMethods(r);

      expectTypeOf(methods).toEqualTypeOf<("get" | "post")[]>();
      expect(methods).toEqual(["get", "post"]);
    });
  });
});
