import { ObjectDef, SchemaDef } from "../def/schema-def";
import { SchemaParser, InferParserSchemaAny } from "./types";

export const createParser = <TParser extends SchemaParser<any>>(
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
      case "date":
      case "null": {
        return { ...config, type: config.type };
      }

      // Complex
      case "array": {
        const element = config.element
          ? parse(config.element)
          : { type: "any" as const };

        return { ...config, type: "array", element };
      }
      case "object": {
        const properties: ObjectDef["properties"] = {};
        for (const key in config.properties ?? {}) {
          const value = config.properties[key];
          properties[key] = parse(value);
        }

        return { ...config, type: "object", properties };
      }
      case "function": {
        const parameters = config.parameters
          ? config.parameters.map(parse)
          : [];
        const result = config.result ? parse(config.result) : undefined;

        return { ...config, type: config.type, parameters, result };
      }

      // Abstract
      case "unwrap": {
        // Pull innerType out
        const { innerType, ...rest } = config;

        const parsed = parse(innerType);

        return { ...rest, ...parsed };
      }
      case "intersection": {
        const members = config.members ? config.members.map(parse) : [];

        return { ...config, type: "intersection", members };
      }
      case "union": {
        const members = config.members ? config.members.map(parse) : [];

        return { ...config, type: "union", members };
      }
      case "tuple": {
        const entries = config.entries ? config.entries.map(parse) : [];

        return { ...config, type: "tuple", entries };
      }
      case "enum": {
        return { ...config };
      }
      case "any": {
        return { type: "any" };
      }

      // Default
      default: {
        return { ...(config ?? {}), type: "unknown" };
      }
    }
  };

  return { parse };
};
