import { describe, expect, test } from "vitest";
import { z } from "zod";
import { route } from ".";

describe("route().execution", () => {
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
      .handle(async (_, c) => {
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
      .handle(async (_, c) => {
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
      .handle(async (_, c) => {
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

  test("Parses incoming headers", async () => {
    const schema = z.object({
      a: z.string().transform((x) => `${x}_transformed`),
    });

    const _route = route()
      .headers(schema)
      .handle((_, c) => {
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
});
