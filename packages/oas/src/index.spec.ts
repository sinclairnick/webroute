import { describe, expect, test, vi } from "vitest";
import { OperationsArrayInput } from "./builder/types";
import { z } from "zod";
import { createSpec } from "./builder/builder";
import { OAS } from "./decorators";

const NullSchema = z.null();

describe("OAS", () => {
  describe("Operation", () => {
    test("Works with single, simple op", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]).toBeDefined();
      expect(spec.paths?.["/foo"]?.get).toBeDefined();
    });

    test("Works with multiple methods", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get", "post"],
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]).toBeDefined();
      expect(spec.paths?.["/foo"]?.get).toBeDefined();
      expect(spec.paths?.["/foo"]?.post).toBeDefined();
    });

    test("Works with multiple ops", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
        },
        {
          path: "/bar",
          methods: ["get"],
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]).toBeDefined();
      expect(spec.paths?.["/foo"]?.get).toBeDefined();
      expect(spec.paths?.["/bar"]).toBeDefined();
      expect(spec.paths?.["/bar"]?.get).toBeDefined();
    });

    test("Works with clashing paths, different method", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
        },
        {
          path: "/foo",
          methods: ["post"],
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]).toBeDefined();
      expect(spec.paths?.["/foo"]?.get).toBeDefined();
      expect(spec.paths?.["/foo"]?.post).toBeDefined();
    });

    test("Calls onCollision when a collision is encountered", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
        },
        {
          path: "/foo",
          methods: ["get"],
        },
      ];

      const onCollision = vi.fn();

      const result = createSpec({
        formatter: (x) => ({}),
        operations: input,
        onCollision,
      });

      const spec = result.getSpec();

      expect(onCollision).toHaveBeenCalled();
    });
  });

  describe("Schema", () => {
    test("Handles query", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          Query: NullSchema,
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.parameters).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.parameters).toHaveLength(1);
      expect(spec.paths?.["/foo"]?.get?.parameters?.[0]).toMatchObject({
        in: "query",
      });
    });

    test("Handles params", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          Params: NullSchema,
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.parameters).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.parameters).toHaveLength(1);
      expect(spec.paths?.["/foo"]?.get?.parameters?.[0]).toMatchObject({
        in: "path",
      });
    });

    test("Handles headers", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          Headers: NullSchema,
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.parameters).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.parameters).toHaveLength(1);
      expect(spec.paths?.["/foo"]?.get?.parameters?.[0]).toMatchObject({
        in: "header",
      });
    });

    test("Handles body", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          Body: NullSchema,
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.requestBody).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.requestBody).toMatchObject({
        content: {
          "application/json": expect.any(Object),
        },
      });
    });

    test("Handles response", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          Output: NullSchema,
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.responses).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.responses).toMatchObject({
        "200": {
          content: {
            "application/json": expect.any(Object),
          },
        },
      });
    });
  });

  describe("Decorators", () => {
    const params = ["Query", "Params", "Headers"] as const;

    test.each(params)(`Handles %s decorators (object)`, (type) => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          [type]: OAS.Param(NullSchema, { name: "CUSTOM" }),
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.parameters).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.parameters?.[0]).toMatchObject({
        name: "CUSTOM",
      });
    });

    test.each(params)("Handles %s decorators (fn)", (type) => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          [type]: OAS.Param(NullSchema, (op) => ({ ...op, name: "CUSTOM" })),
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.parameters).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.parameters?.[0]).toMatchObject({
        name: "CUSTOM",
      });
    });

    test("Handles body decorators (fn)", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          Body: OAS.Body(NullSchema, (op) => ({
            ...op,
            description: "CUSTOM",
          })),
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.requestBody).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.requestBody?.description).toBe(
        "CUSTOM"
      );
    });

    test("Handles response decorators (object)", () => {
      const input: OperationsArrayInput = [
        {
          path: "/foo",
          methods: ["get"],
          Output: OAS.Response(NullSchema, (op) => ({
            ...op,
            "203": {
              content: {
                "application/json": {},
              },
            },
          })),
        },
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.responses).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.responses?.["200"]).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.responses?.["203"]).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.responses?.["203"]).toMatchObject({
        content: {
          "application/json": expect.any(Object),
        },
      });
    });

    test("Handles operator decorators (fn)", () => {
      const input: OperationsArrayInput = [
        OAS.Operation(
          {
            path: "/foo",
            methods: ["get"],
          },
          (op) => ({ ...op, operationId: "CUSTOM" })
        ),
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.operationId).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.operationId).toBe("CUSTOM");
    });

    test("Handles operator decorators (object)", () => {
      const input: OperationsArrayInput = [
        OAS.Operation(
          {
            path: "/foo",
            methods: ["get"],
          },
          { operationId: "CUSTOM" }
        ),
      ];

      const result = createSpec({ formatter: (x) => ({}), operations: input });

      const spec = result.getSpec();

      expect(spec.paths?.["/foo"]?.get?.operationId).toBeDefined();
      expect(spec.paths?.["/foo"]?.get?.operationId).toBe("CUSTOM");
    });
  });
});
