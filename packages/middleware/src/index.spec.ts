import { describe, expect, expectTypeOf, test } from "vitest";
import { AnyMiddlewareFn, defineMiddleware } from ".";

describe("Middleware", () => {
  describe("Types", () => {
    test("Allows empty fns", () => {
      const middleware = (() => {
        return;
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Disallows random first param", () => {
      const middleware = ((a: number) => {
        return;
        // @ts-expect-error
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).not.toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows 1 rest", () => {
      const middleware = ((req: Request, rest1) => {
        return;
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows n rest", () => {
      const middleware = ((req: Request, rest1, rest2) => {
        return;
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows return value object", () => {
      const middleware = ((req: Request, rest1, rest2) => {
        return {};
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Disallows return value as arbitary fn", () => {
      // @ts-expect-error
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return (a: number, b: number) => {};
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).not.toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows return response handler", () => {
      const middleware = ((req: Request, rest1, rest2) => {
        return (response) => new Response();
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Disllows return response handler with random first param", () => {
      // @ts-expect-error
      const middleware = ((opt1) => (req: Request) => {
        return (response: number) => new Response();
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).not.toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows return response handler with rest", () => {
      const middleware = ((req: Request, rest1, rest2) => {
        return (response, rest1, rest2) => new Response();
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows async req handler", () => {
      const middleware = ((req: Request, rest1, rest2) => {
        return (response, rest1, rest2) => new Response();
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows async res handler", () => {
      const middleware = (async (req: Request) => {
        return {};
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });

    test("Allows async res handler", () => {
      const middleware = ((req: Request) => {
        return async () => new Response();
      }) satisfies AnyMiddlewareFn;

      expectTypeOf(middleware).toMatchTypeOf<AnyMiddlewareFn>();
    });
  });

  describe("defineMiddleware", () => {
    test("Jwt example", () => {
      const jwtMiddleware = () =>
        defineMiddleware((req) => {
          const bearer = req.headers.get("authorization");
          const token = bearer?.replace("Bearer ", "");

          return { token };
        });

      const mid = jwtMiddleware();
      const headers = new Headers();
      headers.set("Authorization", "Bearer 1234");
      const result = mid(new Request("https://a.com", { headers }));

      expect(result).toEqual({ token: "1234" });
    });

    test("Powered by example", () => {
      const poweredBy = (opts: { name: string }) =>
        defineMiddleware(() => {
          return (response) => {
            const headers = new Headers(response.headers);

            headers.set("X-Powered-by", opts.name);

            console.log(headers.get("X-Powered-By"));

            return new Response(response.body, {
              headers,
            });
          };
        });

      const mid = poweredBy({ name: "Webroute" });

      const responseHandler = mid();
      expect(responseHandler).toBeTypeOf("function");

      const result = responseHandler(new Response());

      const headers = result.headers;
      expect(headers.get("x-powered-by")).toBe("Webroute");
    });

    test("Works with empty result", () => {
      defineMiddleware(<B>(request: Request, bar: B) => {
        return;
      });
    });

    test("Works with state result", () => {
      defineMiddleware(<B>(request: Request, bar: B) => {
        return {};
      });
    });

    test("Works with response handler result", () => {
      defineMiddleware(<B>(request: Request, bar: B) => {
        return () => new Response();
      });
    });

    test("Doesn't work with primitives or arrays", () => {
      // @ts-expect-error
      defineMiddleware(<B>(request: Request, bar: B) => {
        return [];
      });
      // @ts-expect-error
      defineMiddleware(<B>(request: Request, bar: B) => {
        return 1;
      });
      // @ts-expect-error
      defineMiddleware(<B>(request: Request, bar: B) => {
        return true;
      });
    });

    test("Works with request handler", () => {
      const mid = defineMiddleware(<B>(request: Request, bar: B) => {
        return { foo: 1, bar: "bar" };
      });

      const { bar, foo } = mid(new Request("https://google.com"), "");
      expectTypeOf(foo).toBeNumber();
      expectTypeOf(bar).toBeString();
    });
  });
});
