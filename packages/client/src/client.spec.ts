import { describe, expect, expectTypeOf, test } from "vitest";
import { createTypedClient } from "./client";
import { W } from "./infer";
import { generateTestRoutes } from "./test-util";

describe("Client", () => {
  const routes = generateTestRoutes();
  type App = W.Infer<typeof routes>;

  test("Creates correct path param", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });

    expectTypeOf<Parameters<typeof client>[0]>().toEqualTypeOf<
      "GET /hello" | "GET /bye" | "GET /with/{paramName}" | "POST /hello"
    >();
  });

  test("Creates correct param types", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });
    const getHello = client("GET /hello");

    expectTypeOf<Parameters<typeof getHello>[0]>().toEqualTypeOf<{
      query: {
        hi: number;
      };
      params?: unknown;
      body?: unknown;
    }>();
  });

  test("Creates correct body type", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });

    const postHello = client("POST /hello");
    expectTypeOf<Parameters<typeof postHello>[0]>().toEqualTypeOf<{
      body: {
        notHi: number;
      };
      params?: unknown;
      query?: unknown;
    }>();
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
