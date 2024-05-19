import { describe, expect, expectTypeOf, test } from "vitest";
import { createTypedClient } from "./client";
import { TestAppDef } from "./test-util";

describe("Client", () => {
  type App = TestAppDef;

  test("Creates correct path param", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });

    expectTypeOf<Parameters<typeof client>[0]>().toEqualTypeOf<
      | "GET /hello"
      | "GET /bye"
      | "GET /with/implicit/:paramName"
      | "POST /hello"
      | "GET /with/explicit/:paramName"
    >();
  });

  test("Creates correct param types", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });
    const getHello = client("GET /hello");
    type Config = Parameters<typeof getHello>[0];

    expectTypeOf<Config["body"]>().toBeUnknown();
    expectTypeOf<Config["params"]>().toBeUnknown();
    expectTypeOf<Config["query"]>().toEqualTypeOf<{ hi: number }>();
  });

  test("Creates correct body type", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });
    const postHello = client("POST /hello");
    type Config = Parameters<typeof postHello>[0];

    expectTypeOf<Config["body"]>().toEqualTypeOf<{ notHi: number }>();
    expectTypeOf<Config["params"]>().toBeUnknown();
    expectTypeOf<Config["query"]>().toBeUnknown();
  });

  test("Creates correct return type", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });
    const getHello = client("GET /hello");

    type Expectation = { data: { result: boolean } };
    type Actual = Awaited<ReturnType<typeof getHello>>;
    expectTypeOf<Actual>().toEqualTypeOf<Expectation>();
  });

  test("Creates correct return type with additional context", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {}, b: 2 };
      },
    });
    const getHello = client("GET /hello");

    type Expectation = { data: { result: boolean }; b: number };
    type Actual = Awaited<ReturnType<typeof getHello>>;
    expectTypeOf<Actual>().toEqualTypeOf<Expectation>();
  });

  test("Manages no additionl param", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });

    const getHello = client("GET /hello");
    expectTypeOf<Parameters<typeof getHello>["length"]>().toEqualTypeOf<1>();
  });

  test("Manages one additionl param", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config, options: { a: number }) => {
        return { data: {} };
      },
    });

    const getHello = client("GET /hello");
    expectTypeOf<Parameters<typeof getHello>[1]>().toEqualTypeOf<{
      a: number;
    }>();
  });

  test("Manages multiple additional params", () => {
    const client = createTypedClient<App>()({
      fetcher: async (
        config,
        options: { a: number },
        options2: { b: number }
      ) => {
        return { data: {} };
      },
    });

    const getHello = client("GET /hello");
    expectTypeOf<Parameters<typeof getHello>[1]>().toEqualTypeOf<{
      a: number;
    }>();
    expectTypeOf<Parameters<typeof getHello>[2]>().toEqualTypeOf<{
      b: number;
    }>();
  });

  test("Runs fetcher correctly", async () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        const res = { a: 2 };

        return { data: 1, ...res };
      },
    });

    const getHello = client("GET /hello");

    const result = await getHello({
      query: { hi: 2 },
    });

    expect(result.data).toBe(1);
    expect(result.data).toBe(1);
  });
});
