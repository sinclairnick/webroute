import { describe, expect, expectTypeOf, test } from "vitest";
import { generateTestRoutes } from "../internal/test-util";
import { TypedClient, createTypedClient } from ".";
import { H } from "../infer";

describe("Client", () => {
  const routes = generateTestRoutes();
  type App = H.Infer<typeof routes>;

  test("Computes correct types", async () => {
    const client = createTypedClient<App>({
      fetcher: (path, method, config) => {
        return { path, method, config };
      },
    });

    expectTypeOf<Parameters<typeof client>[0]>().toEqualTypeOf<
      "/hello" | "/bye"
    >();

    const getHello = client("/hello").get;
    expectTypeOf<Parameters<typeof getHello>[0]>().toEqualTypeOf<{
      query: {
        hi: number;
      };
      params?: unknown;
      body?: unknown;
    }>();
    expectTypeOf<ReturnType<typeof getHello>>().toEqualTypeOf<
      Promise<{ result: boolean }>
    >();

    const postHello = client("/hello").post;
    expectTypeOf<Parameters<typeof postHello>[0]>().toEqualTypeOf<{
      body: {
        notHi: number;
      };
      params?: unknown;
      query?: unknown;
    }>();
  });
});
