import { describe, expect, expectTypeOf, test } from "vitest";
import { route } from ".";

describe("route().use", () => {
  test("Handles middleware", async () => {
    const _route = route()
      .use((req) => {
        return { id: "123" };
      })
      .handle((_, { state }) => {
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
      .use((req, { state }) => {
        expectTypeOf<typeof state>().toEqualTypeOf<{ id: string }>();
        return { id: 456 };
      })
      .handle((req, { state }) => {
        return state;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual({ id: 456 });
  });

  test("Supports response middleware", async () => {
    const _route = route()
      .use(() => {
        const userId = 123;

        return (response: Response) => {
          return new Response(`${userId}`);
        };
      })
      .handle((req, { state }) => {
        return state;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual(123);
  });

  test("Runs response middleware in reverse order", async () => {
    let values: string[] = [];

    const _route = route()
      .use(() => {
        const val = "1";

        // This one should run second
        return (response: Response) => {
          values.push(val);
          return new Response(val);
        };
      })
      .use(() => {
        const val = "2";

        // This one should run first
        return (response: Response) => {
          values.push(val);
          return new Response(val);
        };
      })
      .handle((req, { state }) => {
        return state;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual(1);
    expect(values).toEqual(["2", "1"]);
  });
});
