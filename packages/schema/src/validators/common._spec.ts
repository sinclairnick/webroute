import { SchemaDef } from "../def/schema-def";

export const TestCases = [
  ["string", { type: "string" }],
  ["number", { type: "number" }],
  ["symbol", { type: "symbol" }],
  ["boolean", { type: "boolean" }],
  ["undefined", { type: "undefined" }],
  ["null", { type: "null" }],
  ["date", { type: "date" }],
  ["enum", { type: "enum", members: { A: "A", B: "B" } }],
  [
    "objects",
    {
      type: "object",
      properties: {
        a: { type: "number" },
      },
    },
  ],
  [
    "nested objects",
    {
      type: "object",
      properties: {
        a: {
          type: "object",
          properties: {
            b: { type: "object", properties: { c: { type: "boolean" } } },
          },
        },
      },
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
