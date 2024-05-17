import { describe, it, expect } from "vitest";
import * as Radix from "./radix";

const routers = [
  [{ name: "Radix", createRouter: Radix.createRouter }],
] as const;

describe.each(routers)("createRouter", ({ createRouter }) => {
  const createRequest = (url: string, method: string): Request =>
    new Request(url, { method });

  describe(".match()", () => {
    it("should handle empty route initialization correctly", () => {
      const router = createRouter([]);
      expect(
        router.match(createRequest("http://example.com/", "GET"))
      ).toBeUndefined();
    });

    it("should correctly match a single route", () => {
      const router = createRouter([
        { path: "/test", methods: ["GET"], payload: () => "Test handler" },
      ]);
      const result = router.match(
        createRequest("http://example.com/test", "GET")
      );
      expect(result?.()).toBe("Test handler");
    });

    it("should treat paths as case-sensitive", () => {
      const router = createRouter([
        { path: "/Test", methods: ["GET"], payload: () => "Case sensitive" },
      ]);
      expect(
        router.match(createRequest("http://example.com/test", "GET"))
      ).toBeUndefined();
    });

    it("should treat HTTP methods as case-insensitive", () => {
      const router = createRouter([
        { path: "/test", methods: ["get"], payload: () => "Method case" },
      ]);
      const result = router.match(
        createRequest("http://example.com/test", "GET")
      );
      expect(result?.()).toBe("Method case");
    });

    it("should handle multiple handlers for the same path and method correctly", () => {
      const router = createRouter([
        { path: "/test", methods: ["GET"], payload: () => "First handler" },
        { path: "/test", methods: ["GET"], payload: () => "Second handler" },
      ]);
      const result = router.match(
        createRequest("http://example.com/test", "GET")
      );
      expect(result?.()).toBe("First handler");
    });

    it("should return undefined for paths without a handler for the method", () => {
      const router = createRouter([
        { path: "/test", methods: ["POST"], payload: () => "Wrong method" },
      ]);
      expect(
        router.match(createRequest("http://example.com/test", "GET"))
      ).toBeUndefined();
    });

    it("should handle wildcard method", () => {
      const router = createRouter([
        { path: "/test", methods: ["*"], payload: () => "Wildcard" },
      ]);
      const result = router.match(
        createRequest("http://example.com/test", "GET")
      );
      expect(result?.()).toBe("Wildcard");
    });

    it("should match the correct path among multiple routes", () => {
      const router = createRouter([
        { path: "/one", methods: ["GET"], payload: () => "Route one" },
        { path: "/two", methods: ["GET"], payload: () => "Route two" },
      ]);
      const result = router.match(
        createRequest("http://example.com/two", "GET")
      );
      expect(result?.()).toBe("Route two");
    });

    it("should handle query parameters correctly", () => {
      const router = createRouter([
        { path: "/test", methods: ["GET"], payload: () => "Query params" },
      ]);
      const result = router.match(
        createRequest("http://example.com/test?query=123", "GET")
      );
      expect(result?.()).toBe("Query params");
    });

    it("should correctly handle paths with trailing slashes", () => {
      const router = createRouter([
        { path: "/test/", methods: ["GET"], payload: () => "Trailing slash" },
      ]);
      const result = router.match(
        createRequest("http://example.com/test", "GET")
      );
      expect(result?.()).toBe("Trailing slash");
    });

    it("should handle complex paths with parameters", () => {
      const router = createRouter([
        {
          path: "/test/:id",
          methods: ["GET"],
          payload: () => "Path with params",
        },
      ]);
      const result = router.match(
        createRequest("http://example.com/test/123", "GET")
      );
      expect(result?.()).toBe("Path with params");
    });

    it("should return undefined for unmatched paths", () => {
      const router = createRouter([
        { path: "/test", methods: ["GET"], payload: () => "Unmatched path" },
      ]);
      expect(
        router.match(createRequest("http://example.com/unknown", "GET"))
      ).toBeUndefined();
    });

    it("should match handlers using the least-specific method when multiple are available", () => {
      const router = createRouter([
        {
          path: "/test",
          methods: ["GET", "*"],
          payload: () => "Less specific",
        },
      ]);
      const result = router.match(
        createRequest("http://example.com/test", "POST")
      );
      expect(result?.()).toBe("Less specific");
    });

    it("should handle HTTP PUT method correctly", () => {
      const router = createRouter([
        { path: "/test", methods: ["PUT"], payload: () => "PUT method" },
      ]);
      const result = router.match(
        createRequest("http://example.com/test", "PUT")
      );
      expect(result?.()).toBe("PUT method");
    });

    it("should correctly prioritize methods when multiple are defined for a path", () => {
      const router = createRouter([
        { path: "/test", methods: ["GET"], payload: () => "GET method" },
        { path: "/test", methods: ["POST"], payload: () => "POST method" },
      ]);
      const resultGET = router.match(
        createRequest("http://example.com/test", "GET")
      );
      const resultPOST = router.match(
        createRequest("http://example.com/test", "POST")
      );
      expect(resultGET?.()).toBe("GET method");
      expect(resultPOST?.()).toBe("POST method");
    });

    it("should handle routes with multiple methods", () => {
      const router = createRouter([
        {
          path: "/multi",
          methods: ["GET", "POST"],
          payload: () => "Multi method",
        },
      ]);
      const resultGET = router.match(
        createRequest("http://example.com/multi", "GET")
      );
      const resultPOST = router.match(
        createRequest("http://example.com/multi", "POST")
      );
      expect(resultGET?.()).toBe("Multi method");
      expect(resultPOST?.()).toBe("Multi method");
    });

    it("should correctly handle overlapping paths with different methods", () => {
      const router = createRouter([
        { path: "/overlap", methods: ["GET"], payload: () => "Overlap GET" },
        { path: "/overlap", methods: ["POST"], payload: () => "Overlap POST" },
      ]);
      const resultGET = router.match(
        createRequest("http://example.com/overlap", "GET")
      );
      const resultPOST = router.match(
        createRequest("http://example.com/overlap", "POST")
      );
      expect(resultGET?.()).toBe("Overlap GET");
      expect(resultPOST?.()).toBe("Overlap POST");
    });
  });

  describe(".matchAll()", () => {
    it("should return all handlers for a path with multiple registered methods", () => {
      const router = createRouter([
        { path: "/multiple", methods: ["GET"], payload: () => "GET Handler" },
        { path: "/multiple", methods: ["POST"], payload: () => "POST Handler" },
        {
          path: "/multiple",
          methods: ["DELETE"],
          payload: () => "DELETE Handler",
        },
      ]);
      const results = router.matchAll(
        createRequest("http://example.com/multiple", "GET")
      );
      expect(results.map((r) => r())).toContain("GET Handler");
      expect(results).toHaveLength(1);
    });

    it("should return all matching handlers for wildcard methods", () => {
      const router = createRouter([
        {
          path: "/wildcard",
          methods: ["*"],
          payload: () => "Wildcard Handler",
        },
        {
          path: "/wildcard",
          methods: ["GET"],
          payload: () => "Specific GET Handler",
        },
      ]);
      const results = router.matchAll(
        createRequest("http://example.com/wildcard", "GET")
      );
      expect(results.map((r) => r())).toContain("Wildcard Handler");
      expect(results.map((r) => r())).toContain("Specific GET Handler");
      expect(results).toHaveLength(2);
    });

    it("should return handlers for all matches, not just the first one", () => {
      const router = createRouter([
        { path: "/all", methods: ["GET"], payload: () => "First GET Handler" },
        { path: "/all", methods: ["GET"], payload: () => "Second GET Handler" },
      ]);
      const results = router.matchAll(
        createRequest("http://example.com/all", "GET")
      );
      expect(results[0]()).toEqual("First GET Handler");
      expect(results[1]()).toEqual("Second GET Handler");
    });
  });
});
