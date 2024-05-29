import { describe, expect, test } from "vitest";
import { toJsonSchema } from "./json-schema";
import { SchemaDef } from "../typedef/types";

describe("JSON Schema", () => {
  test("Union", () => {
    const input: SchemaDef = {
      type: "union",
      members: [{ type: "string" }, { type: "number" }],
    };

    const result = toJsonSchema(input);

    expect(result.oneOf).toBeDefined();
    expect(result.oneOf).toHaveLength(2);
    expect(result.oneOf?.[0]).toEqual({ type: "string" });
    expect(result.oneOf?.[1]).toEqual({ type: "number" });
  });

  test("Intersection", () => {
    const input: SchemaDef = {
      type: "intersection",
      members: [{ type: "string" }, { type: "number" }],
    };

    const result = toJsonSchema(input);

    expect(result.allOf).toBeDefined();
    expect(result.allOf).toHaveLength(2);
    expect(result.allOf?.[0]).toEqual({ type: "string" });
    expect(result.allOf?.[1]).toEqual({ type: "number" });
  });

  test("Tuple", () => {
    const input: SchemaDef = {
      type: "tuple",
      entries: [{ type: "string" }, { type: "number" }],
    };

    const result = toJsonSchema(input);

    expect(result.type).toEqual("array");
    expect(result.prefixItems).toBeDefined();
    expect(result.prefixItems).toHaveLength(2);
    expect(result.items).toBeUndefined();
    expect(result.minItems).toBe(2);
    expect(result.maxItems).toBe(2);
  });

  test.each(["string", "number", "boolean", "null"] as const)(
    "Primitive: %s",
    (type) => {
      const input: SchemaDef = {
        type,
      };

      const result = toJsonSchema(input);

      expect(result.type).toEqual(type);
    }
  );

  test("Object", () => {
    const input: SchemaDef = {
      type: "object",
      entries: [["a", { type: "string" }]],
    };

    const result = toJsonSchema(input);

    expect(result.type).toEqual("object");
    expect(result.properties?.a).toBeDefined();
    expect(result.properties?.a).toEqual({ type: "string" });
  });

  test("Convoluted types", () => {
    const input: SchemaDef = {
      type: "object",
      entries: [
        [
          "a",
          {
            type: "array",
            element: {
              type: "object",
              entries: [
                ["b", { type: "string" }],
                [
                  "c",
                  {
                    type: "number",
                    optional: true,
                  },
                ],
              ],
            },
          },
        ],
      ],
      nullable: true,
    };

    const result = toJsonSchema(input);

    expect(result.oneOf).toBeDefined();
    expect(result.oneOf).toHaveLength(2);
    expect(result.oneOf?.[0]).toEqual({ type: "null" });
    expect(result.oneOf?.[1]).toEqual({
      type: "object",
      required: ["a"],
      properties: {
        a: {
          type: "array",
          items: {
            type: "object",
            required: ["b"],
            properties: {
              b: {
                type: "string",
              },
              c: {
                anyOf: [{}, { type: "number" }],
              },
            },
          },
        },
      },
    });
  });

  test("Array", () => {
    const input: SchemaDef = {
      type: "array",
      element: {
        type: "string",
      },
    };

    const result = toJsonSchema(input);

    expect(result.type).toEqual("array");
    expect(result.items).toBeDefined();
    expect(result.items).toEqual({ type: "string" });
  });

  test("Primitive nullable", () => {
    const input: SchemaDef = {
      type: "string",
      nullable: true,
    };

    const result = toJsonSchema(input);

    expect(result.oneOf).toBeDefined();
    expect(result.oneOf).toHaveLength(2);
    expect(result.oneOf?.[0]).toEqual({ type: "null" });
    expect(result.oneOf?.[1]).toEqual({ type: "string" });
  });

  test("Primitive optional", () => {
    const input: SchemaDef = {
      type: "string",
      optional: true,
    };

    const result = toJsonSchema(input);

    expect(result.anyOf).toBeDefined();
    expect(result.anyOf).toHaveLength(2);
    expect(result.anyOf?.[0]).toEqual({});
    expect(result.anyOf?.[1]).toEqual({ type: "string" });
  });

  test("Complex nullable", () => {
    const input: SchemaDef = {
      type: "object",
      entries: [["a", { type: "string" }]],
      nullable: true,
    };

    const result = toJsonSchema(input);

    expect(result.oneOf).toBeDefined();
    expect(result.oneOf).toHaveLength(2);
    expect(result.oneOf?.[0]).toEqual({ type: "null" });
    expect(result.oneOf?.[1]).toMatchObject({ type: "object" });
  });

  test("Complex optional", () => {
    const input: SchemaDef = {
      type: "object",
      entries: [["a", { type: "string" }]],
      optional: true,
    };

    const result = toJsonSchema(input);

    expect(result.anyOf).toBeDefined();
    expect(result.anyOf).toHaveLength(2);
    expect(result.anyOf?.[0]).toEqual({});
    expect(result.anyOf?.[1]).toMatchObject({ type: "object" });
  });

  test("Adds description", () => {
    const input: SchemaDef = {
      type: "string",
      description: "A string",
    };

    const result = toJsonSchema(input);

    expect(result.type).toBe("string");
    expect(result.description).toBe("A string");
  });

  test("Adds default", () => {
    const input: SchemaDef = {
      type: "string",
      default_: "foo",
    };

    const result = toJsonSchema(input);

    expect(result.type).toBe("string");
    expect(result.default).toBe("foo");
  });
});
