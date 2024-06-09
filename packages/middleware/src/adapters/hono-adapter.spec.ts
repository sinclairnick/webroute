import { describe, expect, test } from "vitest";
import { toHono } from "./hono-adapter";
import { testMiddleware, testReq } from "./test-util";
import { Hono } from "hono";

describe("Hono adapter", () => {
  test("Works", async () => {
    const honoMiddleware = toHono((c) => testMiddleware(c.req.raw));

    const app = new Hono();

    app.use("*", (c, next) => {
      return honoMiddleware(c, next);
    });

    const result = await app.fetch(testReq("abc"));

    expect(result.headers.get("x-test-header")).toBe("abc");
  });
});
