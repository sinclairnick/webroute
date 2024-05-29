import { describe, expect, test, vi } from "vitest";
import { CaseMap, TestCases } from "./common._spec";
import { createParser } from "../parser/parser";
import { createFormatter } from "../formatter/formatter";
import * as S from "superstruct";
import { SuperstructFormatter, SupertstructParser } from "./superstruct";

const schemas = {
  string: S.string(),
  boolean: S.boolean(),
  number: S.number(),
  objects: S.object({
    a: S.number(),
  }),
  "nested objects": S.object({
    a: S.object({
      b: S.object({
        c: S.boolean(),
      }),
    }),
  }),
  arrays: S.array(S.string()),
  "nested arrays": S.array(S.array(S.string())),
  any: S.any(),

  // TODO: Superstruct doesn't seem to actually define
  // this information anywhere, declaratively.
  // optionals: S.optional(S.number()),
  // intersections: S.intersection([S.number(), S.boolean()]),
  // unions: S.union([S.number(), S.boolean()]),
  // tuples: S.tuple([S.number(), S.boolean()]),
} satisfies Partial<CaseMap>;

describe("Typebox", () => {
  describe("Parser", () => {
    const parser = createParser(SupertstructParser());

    test.each(TestCases)("Works with %s", (key, def) => {
      const schema = schemas[key as keyof typeof schemas];

      if (!schema) {
        console.log(`Skipping ${key} test, schema not found.`);
        return;
      }

      expect(parser.parse(schema as any)).toEqual(def);
    });
  });

  describe("Formatter", () => {
    const formatter = createFormatter(SuperstructFormatter());

    test.each(TestCases)("Works with %s", (key, def) => {
      const result = formatter.format(def);
      const expected = schemas[key as keyof typeof schemas];

      if (!expected) return;

      expect(result.type).toEqual(result.type);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(result));
    });
  });
});

console.log(S.intersection([S.number(), S.boolean()]));
