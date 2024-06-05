import { describe, expect, test } from "vitest";
import { CaseMap, TestCases } from "./common._spec";
import { createParser } from "../parser/parser";
import { createFormatter } from "../formatter/formatter";
import * as Y from "yup";
import { YupFormatter, YupParser } from "./yup";

const schemas = {
  string: Y.string(),
  boolean: Y.bool(),
  number: Y.number(),
  objects: Y.object({
    a: Y.number(),
  }),
  date: Y.date(),
  "nested objects": Y.object({
    a: Y.object({
      b: Y.object({
        c: Y.boolean(),
      }),
    }),
  }),
  nullables: Y.boolean().nullable(),
  arrays: Y.array(Y.string()),
  "nested arrays": Y.array(Y.array(Y.string())),
  tuples: Y.tuple([Y.number(), Y.boolean()]),
  enum: Y.mixed().oneOf(["A", "B"]),
} satisfies Partial<CaseMap>;

describe("Typebox", () => {
  describe("Parser", () => {
    const parser = createParser(YupParser());

    for (const [key, def] of TestCases) {
      const schema = schemas[key as keyof typeof schemas];
      const title = `Works with ${key}`;

      if (!schema) {
        test.skip(title);
        continue;
      }

      test(title, () => {
        expect(parser.parse(schema)).toEqual(def);
      });
    }
  });

  describe("Formatter", () => {
    const formatter = createFormatter(YupFormatter());

    for (const [key, def] of TestCases) {
      const expected = schemas[key as keyof typeof schemas];
      const title = `Works with ${key}`;

      if (!expected) {
        test.skip(title);
        continue;
      }

      test(title, () => {
        const result = formatter.format(def);

        expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
      });
    }
  });
});
