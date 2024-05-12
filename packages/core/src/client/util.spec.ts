import { describe, expect, test } from "vitest";
import { createUrl } from "./util";

describe("Util", () => {
  test("Inlines missing path values", () => {
    const result = createUrl({
      method: "get",
      path: "/user/:userId/posts/:postId/new",
    });

    expect(result).toBe("/user/undefined/posts/undefined/new");
  });

  test("Inlines partial path values", () => {
    const result = createUrl({
      method: "get",
      path: "/user/:userId/posts/:postId/new",
      params: { userId: "123" },
    });

    expect(result).toBe("/user/123/posts/undefined/new");
  });

  test("Inlines multiple path values", () => {
    const result = createUrl({
      method: "get",
      path: "/user/:userId/posts/:postId/new",
      params: { userId: "123", postId: "456" },
    });

    expect(result).toBe("/user/123/posts/456/new");
  });

  test("Ignores extraneous path values", () => {
    const result = createUrl({
      method: "get",
      path: "/user/:userId/posts/:postId/new",
      params: { userId: "123", postId: "456", blah: 24 },
    });

    expect(result).toBe("/user/123/posts/456/new");
  });

  test("Adds query params", () => {
    const result = createUrl({
      method: "get",
      path: "/user",
      query: {
        a: 1,
        b: 2,
      },
    });

    expect(result).toBe("/user?a=1&b=2");
  });

  test("Encodes query params", () => {
    const result = createUrl({
      method: "get",
      path: "/user",
      query: {
        a: "%hello",
        b: [1, 2],
      },
    });

    expect(result).toBe("/user?a=%25hello&b=1&b=2");
  });

  test("Handles relative url", () => {
    const result = createUrl({
      method: "get",
      path: "/user",
    });

    expect(result).toBe("/user");
  });

  test("Handles absolute url", () => {
    const result = createUrl({
      method: "get",
      path: "https://webroute.dev/user",
    });

    expect(result).toBe("https://webroute.dev/user");
  });
});
