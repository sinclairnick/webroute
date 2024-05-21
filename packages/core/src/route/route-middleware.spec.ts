import { describe, expect, expectTypeOf, test } from "vitest";
import { route } from ".";

describe("route().use", () => {
  test("Handles middleware", async () => {
    const _route = route()
      .use((req) => {
        return { id: "123" };
      })
      .handle((_, { state }) => {
        expectTypeOf(state.id).toEqualTypeOf<string>();
        return state.id;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual("123");
  });

  test("Handles chained middleware", async () => {
    const _route = route()
      .use((req, { state }) => {
        return { id: "123" };
      })
      .use((req, { state }) => {
        return { id: true };
      })
      .use((req, { state }) => {
        expectTypeOf<typeof state>().toEqualTypeOf<{ id: boolean }>();
        return { id: 456 };
      })
      .handle((req, { state }) => {
        expectTypeOf<typeof state>().toEqualTypeOf<{ id: number }>();
        return state;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual({ id: 456 });
  });

  test("Handles conditional middleware", async () => {
    const _route = route()
      .use(() => {
        if (Math.random()) {
          return { id: "123" };
        }
        return new Response("");
      })
      .handle((req, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ id: string }>();
        return state;
      });
  });

  test("Handles chained middleware with response", async () => {
    const _route = route()
      .use(() => {
        if (Math.random()) {
          return { id: "123" };
        }
        return new Response("");
      })
      .use((_, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ id: string }>();
        return new Response("");
      })
      .use((_, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ id: string }>();
        return new Response("");
      })
      .handle((req, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ id: string }>();
        return state;
      });
  });

  test("Retains type with spread", () => {
    const _route = route()
      .use(() => {
        if (Math.random()) {
          return { id: "123" };
        }
        return new Response("");
      })
      .use((_, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ id: string }>();
        return { ...state, a: 1 };
      })
      .use((_, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ id: string; a: number }>();
        return { ...state, b: 2 };
      })
      .handle((req, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{
          id: string;
          a: number;
          b: number;
        }>();
      });
  });

  test("Overwrites state if not spread", () => {
    const _route = route()
      .use(() => {
        return { id: "123" };
      })
      .use((_, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ id: string }>();
        return { a: 1 };
      })
      .handle((req, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ a: number }>();
      });
  });

  test("Skips remaining request middleware in early exit", async () => {
    let didRun = false;

    const _route = route()
      .use((_, { state }) => {
        return new Response("0");
      })
      .use(() => {
        didRun = true;
      })
      .handle((req, { state }) => {});

    const res = await _route(new Request("https://google.com"));
    const data = await res.json();
    expect(data).toBe(0);
    expect(didRun).toBe(false);
  });

  test("Allows arbitrary mutation", () => {
    const _route = route()
      .use<{ foo: number }>((_, { state }) => {
        (state as any).foo = 1;

        return;
      })
      .handle((req, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ foo: number }>();
      });
  });

  test("Explicit type param appends, not overwrites", () => {
    const _route = route()
      .use(() => {
        return { a: "" };
      })
      .use<{ foo: number }>((_, { state }) => {
        (state as any).foo = 1;

        return;
      })
      .handle((req, { state }) => {
        expectTypeOf(state).toEqualTypeOf<{ foo: number; a: string }>();
      });
  });

  test("Return value replaces existing state", async () => {
    const _route = route()
      .use(() => {
        return { a: "a" };
      })
      .use((_, { state }) => {
        return { b: "b" };
      })
      .handle((req, { state }) => {
        return state;
      });

    const req = new Request("https://google.com");
    const res = await _route(req);
    const data = await res.json();

    expect(data).toEqual({ b: "b" });
  });

  test("Supports response middleware", async () => {
    const _route = route()
      .use((_, { state }) => {
        const userId = 123;

        return (response) => {
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
        return (response, { state }) => {
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
