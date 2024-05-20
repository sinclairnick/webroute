import { describe, expect, expectTypeOf, test } from "vitest";
import { MiddlewareBuilder } from "./types";
import { defineMiddleware } from ".";

describe("Middleware", () => {
  describe("Types", () => {
    test("Allows empty fns", () => {
      const middleware = (() => () => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Disallows random first param", () => {
      // @ts-expect-error
      const middleware = (() => (a: number) => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).not.toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows no options", () => {
      const middleware = (() => (req: Request) => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows one option", () => {
      const middleware = ((opt) => (req: Request) => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows n options", () => {
      const middleware = ((opt1, opt2, opt3) => (req: Request) => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows n options", () => {
      const middleware = ((opt1, opt2, opt3) => (req: Request) => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows 1 rest", () => {
      const middleware = ((opt1) => (req: Request, rest1) => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows n rest", () => {
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows return value number", () => {
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return 1;
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows return value object", () => {
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return {};
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows return value array", () => {
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return [];
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Disallows return value as arbitary fn", () => {
      // @ts-expect-error
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return (a: number, b: number) => {};
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).not.toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows return response handler", () => {
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return (response) => new Response();
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Disllows return response handler with random first param", () => {
      // @ts-expect-error
      const middleware = ((opt1) => (req: Request) => {
        return (response: number) => new Response();
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).not.toMatchTypeOf<MiddlewareBuilder>();
    });

    test("Allows return response handler with rest", () => {
      const middleware = ((opt1) => (req: Request, rest1, rest2) => {
        return (response, rest1, rest2) => new Response();
      }) satisfies MiddlewareBuilder;

      expectTypeOf(middleware).toMatchTypeOf<MiddlewareBuilder>();
    });
  });

  describe("defineMiddleware", () => {
    test("Jwt example", () => {
      const jwtMiddleware = defineMiddleware(
        (options: { secret: string }) => (req) => {
          const bearer = req.headers.get("authorization");
          const token = bearer?.replace("Bearer ", "");

          return { token };
        }
      );

      const mid = jwtMiddleware({ secret: "abc" });
      const headers = new Headers();
      headers.set("Authorization", "Bearer 1234");
      const result = mid(new Request("https://a.com", { headers }));

      expect(result).toEqual({ token: "1234" });
    });

    test("Powered by example", () => {
      const poweredBy = defineMiddleware((opts: { name: string }) => () => {
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
  });
});
