import { describe, expect, test } from "vitest";
import { CaseMap, TestCases } from "./common._spec";
import { createParser } from "../parser/parser";
import { TypeBoxFormatter, TypeBoxParser } from "./typebox";
import * as T from "@sinclair/typebox";
import { createFormatter } from "../formatter/formatter";

const schemas = {
  string: T.String(),
  boolean: T.Boolean(),
  number: T.Number(),
  symbol: T.Symbol(),
  undefined: T.Undefined(),
  objects: T.Object({
    a: T.Number(),
  }),
  "nested objects": T.Object({
    a: T.Object({
      b: T.Object({
        c: T.Boolean(),
      }),
    }),
  }),
  optionals: T.Optional(T.Number()),
  arrays: T.Array(T.String()),
  "nested arrays": T.Array(T.Array(T.String())),
  intersections: T.Intersect([T.Number(), T.Boolean()]),
  unions: T.Union([T.Number(), T.Boolean()]),
  tuples: T.Tuple([T.Number(), T.Boolean()]),
  any: T.Any(),
} satisfies Partial<CaseMap>;

describe("TypeBox", () => {
  describe("Parser", () => {
    const parser = createParser(TypeBoxParser());

    test.each(TestCases)("Works with %s", (key, def) => {
      const schema = schemas[key as keyof typeof schemas];

      if (!schema) {
        console.log(`Skipping ${key} test, schema not found.`);
        return;
      }

      expect(parser.parse(schema)).toEqual(def);
    });
  });

  describe("Formatter", () => {
    const formatter = createFormatter(TypeBoxFormatter());

    test.each(TestCases)("Works with %s", (key, def) => {
      const result = formatter.format(def);
      const expected = schemas[key as keyof typeof schemas];

      if (!expected) return;

      expect(result[T.Kind]).toEqual(expected[T.Kind]);
      expect(result).toEqual(expected);
    });
  });
});
