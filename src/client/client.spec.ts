import { describe, expect, expectTypeOf, test } from "vitest";
import { generateTestRoutes } from "../internal/test-util";
import { createTypedClient } from "./client";
import { H } from "../infer";

describe("Client", () => {
  const routes = generateTestRoutes();
  type App = H.Infer<typeof routes>;

  test("Creates correct path param", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });

    expectTypeOf<Parameters<typeof client>[0]>().toEqualTypeOf<
      "/hello" | "/bye" | "/with/{paramName}"
    >();
  });

  test("Creates correct param types", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });
    const getHello = client("/hello").get;

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

    const postHello = client("/hello").post;
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
    const getHello = client("/hello").get;

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
    const getHello = client("/hello").get;

    type Expectation = { data: { result: boolean }; b: number };
    type Actual = Awaited<ReturnType<typeof getHello>>;
    expectTypeOf<Actual>().toEqualTypeOf<Expectation>();
  });

  test("Creates correct options type", () => {
    const client = createTypedClient<App>()({
      fetcher: async (config, options: { a: number }) => {
        return { data: {} };
      },
    });

    const getHello = client("/hello").get;
    expectTypeOf<Parameters<typeof getHello>[1]>().toEqualTypeOf<{
      a: number;
    }>();
  });

  test("Runs fetcher correctly", async () => {
    const client = createTypedClient<App>()({
      fetcher: async (config) => {
        const res = { a: 2 };

        return { data: 1, ...res };
      },
    });

    const result = await client("/hello").get({
      query: { hi: 2 },
    });

    expect(result.data).toBe(1);
    expect(result.data).toBe(1);
  });
});
