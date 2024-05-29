import { SchemaDef } from "../typedef/types";
import { SchemaParser, InferParserSchemaAny } from "./types";

export const createParser = <TParser extends SchemaParser<any, any>>(
  parser: TParser
) => {
  const parse = (schema: InferParserSchemaAny<TParser>): SchemaDef => {
    const config = parser.identifyType(schema);

    switch (config?.type) {
      // Primitive
      case "boolean":
      case "number":
      case "string":
      case "symbol":
      case "undefined":
      case "null": {
        return {
          ...config,
          type: config.type,
        };
      }

      // Complex
      case "array": {
        const element = parser.getArrayElement(schema);

        return {
          ...config,
          type: "array",
          element: element ? parse(element) : { type: "any" },
        };
      }
      case "object": {
        const fields = parser.getObjectEntries(schema);

        return {
          ...config,
          type: "object",
          entries: fields
            ? fields.map(([key, value]) => [key, parse(value)])
            : [],
        };
      }
      case "function": {
        return {
          ...config,
          type: config.type,
        };
      }

      // Abstract
      case "nullable": {
        const inner = parser.getNullableMember?.(schema);

        return inner
          ? {
              ...config,
              ...parse(inner),
              nullable: true,
            }
          : {
              ...config,
              type: "unknown",
              nullable: true,
            };
      }
      case "optional": {
        const inner = parser.getOptionalMember?.(schema);

        return inner
          ? {
              ...config,
              ...parse(inner),
              optional: true,
            }
          : {
              ...config,
              type: "unknown",
              optional: true,
            };
      }
      case "intersection": {
        const members = parser.getIntersectionMembers?.(schema);

        return {
          ...config,
          type: "intersection",
          members: members ? members.map(parse) : [{ type: "unknown" }],
        };
      }
      case "union": {
        const members = parser.getUnionMembers?.(schema);

        return {
          ...config,
          type: "union",
          members: members?.map(parse) ?? [{ type: "unknown" }],
        };
      }
      case "tuple": {
        const entries = parser.getTupleEntries?.(schema);

        return {
          ...config,
          type: "tuple",
          entries: entries?.map(parse) ?? [],
        };
      }
      case "any": {
        return { type: "any" };
      }

      // Default
      default: {
        return {
          ...config,
          type: "unknown",
        };
      }
    }
  };

  return { parse };
};
