import { describe, expect, test } from "vitest";
import { SchemaParser } from "../parser/types";
import { createParser } from "../parser/parser";
import { SchemaDef } from "../typedef/types";
import { createFormatter } from "../formatter/formatter";
import { SchemaFormatter } from "../formatter/types";

export const TestCases = [
  ["string", { type: "string" }],
  ["number", { type: "number" }],
  ["symbol", { type: "symbol" }],
  ["boolean", { type: "boolean" }],
  ["undefined", { type: "undefined" }],
  [
    "objects",
    {
      type: "object",
      entries: [["a", { type: "number" }]],
    },
  ],
  [
    "nested objects",
    {
      type: "object",
      entries: [
        [
          "a",
          {
            type: "object",
            entries: [
              ["b", { type: "object", entries: [["c", { type: "boolean" }]] }],
            ],
          },
        ],
      ],
    },
  ],
  [
    "optionals",
    {
      type: "number",
      optional: true,
    },
  ],
  [
    "nullables",
    {
      type: "boolean",
      nullable: true,
    },
  ],
  [
    "arrays",
    {
      type: "array",
      element: {
        type: "string",
      },
    },
  ],
  [
    "nested arrays",
    {
      type: "array",
      element: {
        type: "array",
        element: {
          type: "string",
        },
      },
    },
  ],
  [
    "intersections",
    {
      type: "intersection",
      members: [{ type: "number" }, { type: "boolean" }],
    },
  ],
  [
    "unions",
    {
      type: "union",
      members: [{ type: "number" }, { type: "boolean" }],
    },
  ],
  [
    "tuples",
    {
      type: "tuple",
      entries: [{ type: "number" }, { type: "boolean" }],
    },
  ],
  ["any", { type: "any" }],
] as const satisfies [string, SchemaDef][];

export type CaseName = (typeof TestCases)[number][0];

export type CaseMap = Record<CaseName, any>;

export const runTests = (
  s: SchemaParser<any, any>,
  f: SchemaFormatter<any>,
  schemas: CaseMap
) => {
  const parser = createParser(s);
  const formatter = createFormatter(f);

  describe("Parser", () => {
    test.each(TestCases)("Works with %s", (key, def) => {
      expect(parser.parse(schemas[key])).toEqual(def);
    });
  });

  describe.only("Formatter", () => {
    test.each(TestCases)("Works with %s", (key, def) => {
      const result = formatter.format(def);
      const expected = schemas[key];

      expect(result).toEqual(expected);
    });
  });
};
