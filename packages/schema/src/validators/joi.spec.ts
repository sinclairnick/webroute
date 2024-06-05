import { describe, expect, test } from "vitest";
import { CaseMap, TestCases } from "./common._spec";
import { createParser } from "../parser/parser";
import { JoiFormatter, JoiParser } from "./joi";
import * as J from "joi";
import { createFormatter } from "../formatter/formatter";

const schemas = {
  string: J.string(),
  boolean: J.bool(),
  number: J.number(),
  symbol: J.symbol(),
  date: J.date(),
  objects: J.object({
    a: J.number(),
  }),
  "nested objects": J.object({
    a: J.object({ b: J.object({ c: J.bool() }) }),
  }),
  optionals: J.number().optional(),
  arrays: J.array().items(J.string()),
  "nested arrays": J.array().items(J.array().items(J.string())),
  unions: J.alternatives(J.number(), J.boolean()).match("any"),
  intersections: J.alternatives(J.number(), J.boolean()).match("all"),
  any: J.any(),
  enum: J.string().valid("A", "B"),
  nullables: J.boolean().allow(null),
  null: J.any().valid(null),
} satisfies Partial<CaseMap>;

describe("Joi", () => {
  describe("Parser", () => {
    const parser = createParser(JoiParser());

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
    const formatter = createFormatter(JoiFormatter());

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
    test.each(TestCases)("Works with %s", (key, def) => {});
  });
});
