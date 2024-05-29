import { describe, expect, test } from "vitest";
import { CaseMap, TestCases, runTests } from "./common._spec";
import * as v from "valibot";
import { ValibotFormatter, ValibotParser } from "./valibot";
import { createParser } from "../parser/parser";
import { createFormatter } from "../formatter/formatter";

const schemas = {
  string: v.string(),
  boolean: v.boolean(),
  number: v.number(),
  symbol: v.symbol(),
  undefined: v.undefined_(),
  objects: v.object({
    a: v.number(),
  }),
  "nested objects": v.object({
    a: v.object({
      b: v.object({
        c: v.boolean(),
      }),
    }),
  }),
  optionals: v.optional(v.number()),
  nullables: v.nullable(v.boolean()),
  arrays: v.array(v.string()),
  "nested arrays": v.array(v.array(v.string())),
  intersections: v.intersect([v.number(), v.boolean()]),
  unions: v.union([v.number(), v.boolean()]),
  tuples: v.tuple([v.number(), v.boolean()]),
  any: v.any(),
} satisfies CaseMap;

describe("Valibot", () => {
  describe("Parser", () => {
    const parser = createParser(ValibotParser());

    test.each(TestCases)("Works with %s", (key, def) => {
      expect(parser.parse(schemas[key])).toEqual(def);
    });
  });

  describe("Formatter", () => {
    const formatter = createFormatter(ValibotFormatter());

    test.each(TestCases)("Works with %s", (key, def) => {
      const result = formatter.format(def);
      const expected = schemas[key];

      expect(result.type).toEqual(expected.type);
      expect(result._types).toEqual(expected._types);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(result));
    });
  });
});
