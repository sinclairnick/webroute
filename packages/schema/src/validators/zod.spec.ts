import { describe, expect, test } from "vitest";
import { CaseMap, TestCases, runTests } from "./common._spec";
import { ZodFormatter, ZodParser } from "./zod";
import { z } from "zod";
import { createParser } from "../parser/parser";
import { createFormatter } from "../formatter/formatter";

const schemas = {
  string: z.string(),
  boolean: z.boolean(),
  number: z.number(),
  symbol: z.symbol(),
  undefined: z.undefined(),
  objects: z.object({
    a: z.number(),
  }),
  "nested objects": z.object({
    a: z.object({
      b: z.object({
        c: z.boolean(),
      }),
    }),
  }),
  optionals: z.number().optional(),
  nullables: z.boolean().nullable(),
  arrays: z.string().array(),
  "nested arrays": z.string().array().array(),
  intersections: z.intersection(z.number(), z.boolean()),
  unions: z.union([z.number(), z.boolean()]),
  tuples: z.tuple([z.number(), z.boolean()]),
  any: z.any(),
} satisfies CaseMap;

describe("Zod", () => {
  describe("Parser", () => {
    const parser = createParser(ZodParser());

    test.each(TestCases)("Works with %s", (key, def) => {
      expect(parser.parse(schemas[key])).toEqual(def);
    });
  });

  describe("Formatter", () => {
    const formatter = createFormatter(ZodFormatter());

    test.each(TestCases)("Works with %s", (key, def) => {
      const result = formatter.format(def);
      const expected = schemas[key];

      // Comparing schema is hard because they contain classes
      // and functions with ambiguous identities.
      // Comparisons thus usually fail.
      // Instead we do a "good enough" comparison.
      expect(result._type).toEqual(expected._type);
      expect(Object.keys(result._def)).toEqual(Object.keys(expected._def));
      expect(JSON.stringify(result)).toEqual(JSON.stringify(result));
    });
  });
});
