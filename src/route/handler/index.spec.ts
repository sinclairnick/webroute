import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { HandlerBuilder, createBuilder } from ".";
import { z } from "zod";
import { ParsedQs } from "qs";

describe("Handler", () => {
  test("Initially has no type info", () => {
    const result = createBuilder();

    type TParams = typeof result extends HandlerBuilder<infer TParams>
      ? TParams
      : never;

    expectTypeOf<TParams["_query_out"]>().toEqualTypeOf<unknown>();
    expectTypeOf<TParams["_params_out"]>().toEqualTypeOf<unknown>();
    expectTypeOf<TParams["_body_out"]>().toEqualTypeOf<unknown>();
    expectTypeOf<TParams["_output_out"]>().toEqualTypeOf<unknown>();
  });

  test("Initially has no schema info", () => {
    const result = createBuilder();

    expect(result._def.query).toBeUndefined();
    expect(result._def.params).toBeUndefined();
    expect(result._def.body).toBeUndefined();
    expect(result._def.output).toBeUndefined();
  });

  test(".query() adds query param", () => {
    const schema = z.object({ a: z.number() });
    const result = createBuilder().query(schema);

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
    const result = createBuilder().params(schema);

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
    const result = createBuilder().body(schema);

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
    const result = createBuilder().output(schema);

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
    const route = createBuilder().handle(async (req, res, next) => {
      return { data: true };
    });

    const res = { json: vi.fn() };

    await route({} as any, res as any, () => {});

    expect(res.json).toHaveBeenCalled();
    const call = res.json.mock.calls[0][0];
    expect(call).toEqual({ data: true });
  });

  test("handle() parses query", async () => {
    const schema = z.object({
      a: z.number().transform((x) => `${x}_transformed`),
    });

    let query: any;
    const route = createBuilder()
      .query(schema)
      .handle(async (req, res, next) => {
        query = req.query;
      });

    const res = { json: vi.fn() };
    const req = { query: { a: 1 } };
    await route(req as any, res as any, () => {});

    expect(query).toBeDefined();
    expect(query.a).toEqual("1_transformed");
  });

  test("handle() parses params", async () => {
    const schema = z.object({
      a: z.number().transform((x) => `${x}_transformed`),
    });

    let params: any;
    const route = createBuilder()
      .params(schema)
      .handle(async (req, res, next) => {
        params = req.params;
      });

    const res = { json: vi.fn() };
    const req = { params: { a: 1 } };
    await route(req as any, res as any, () => {});

    expect(params).toBeDefined();
    expect(params.a).toEqual("1_transformed");
  });

  test("handle() parses body", async () => {
    const schema = z.object({
      a: z.number().transform((x) => `${x}_transformed`),
    });

    let body: any;
    const route = createBuilder()
      .body(schema)
      .handle(async (req, res, next) => {
        body = req.body;
      });

    const res = { json: vi.fn() };
    const req = { body: { a: 1 } };
    await route(req as any, res as any, () => {});

    expect(body).toBeDefined();
    expect(body.a).toEqual("1_transformed");
  });

  test("handle() parses output", async () => {
    const schema = z.object({
      a: z.number().transform((x) => `${x}_transformed`),
    });

    const route = createBuilder()
      .output(schema)
      .handle(async (req, res, next) => {
        return { a: 1 };
      });

    const res = { json: vi.fn() };
    const req = {};
    await route(req as any, res as any, () => {});

    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];

    expect(body).toBeDefined();
    expect(body.a).toEqual("1_transformed");
  });

  test("handle() uses more relaxed handler type", () => {
    const route = createBuilder().params(z.object({ a: z.number() }));

    type HandlerFn = Parameters<(typeof route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[0];

    expectTypeOf<ReqParam["params"]>().toEqualTypeOf<{ a: number }>();
    expectTypeOf<ReqParam["query"]>().toEqualTypeOf<ParsedQs>();
    expectTypeOf<ReqParam["body"]>().toEqualTypeOf<any>();
    expectTypeOf<ReqParam["body"]>().toEqualTypeOf<any>();
  });
});
