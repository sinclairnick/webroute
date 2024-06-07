import { describe, expect, expectTypeOf, test } from "vitest";
import { route } from ".";
import { RouteBuilder } from "./handler/builder";
import { LazyValidator } from "./handler/types";
import { z } from "zod";

describe("route().<schema>", () => {
  test("Initially has no type info", () => {
    const result = route();

    type TParams = typeof result extends RouteBuilder<infer TParams>
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

    type QueryType = typeof result extends RouteBuilder<infer TParams>
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

    type ParamType = typeof result extends RouteBuilder<infer TParams>
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

    type BodyType = typeof result extends RouteBuilder<infer TParams>
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

    type BodyType = typeof result extends RouteBuilder<infer TParams>
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

    type OutputType = typeof result extends RouteBuilder<infer TParams>
      ? TParams["OutputIn"]
      : never;
    type OutputTypeOut = typeof result extends RouteBuilder<infer TParams>
      ? TParams["OutputOut"]
      : never;

    expectTypeOf<OutputType>().toEqualTypeOf<{ a: number }>();
    expectTypeOf<OutputTypeOut>().not.toEqualTypeOf<{ a: number }>();
  });

  test("Works with .headers", () => {
    const _route = route().headers(z.object({ auth: z.boolean() }));

    type HandlerFn = Parameters<(typeof _route)["handle"]>[0];
    type ReqParam = Parameters<HandlerFn>[1];

    expectTypeOf<ReqParam["headers"]>().toMatchTypeOf<
      LazyValidator<{ auth: boolean }>
    >();
  });
});
