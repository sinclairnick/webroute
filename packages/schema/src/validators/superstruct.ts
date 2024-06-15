import * as S from "superstruct";
import { SchemaParser } from "../parser/types";
import { SchemaFormatter } from "../formatter/types";
import { SchemaDefOptions } from "../def/core";
import { SchemaDiscriminator } from "../discriminator/types";
import { createJsonSchemaFormatter } from "../util";

export type AnySuperstructSchema = S.Struct<any, any>;

export const SupertstructParser = (): SchemaParser<AnySuperstructSchema> => {
  return {
    identifyType(schema) {
      const opts: SchemaDefOptions = {};

      switch (schema.type) {
        // Containers
        case "object": {
          return { ...opts, type: "object", properties: schema.schema };
        }
        case "array": {
          return { ...opts, type: "array", element: schema.schema };
        }
        // Note: Superstruct provides no way of knowing
        // what set members exist
        case "intersection": {
          return { ...opts, type: "intersection", members: [] };
        }
        case "union": {
          return { ...opts, type: "union", members: [] };
        }
        case "tuple": {
          return { ...opts, type: "tuple", entries: [] };
        }
        case "func": {
          return { ...opts, type: "function" };
        }
        case "enums": {
          return { ...opts, type: "enum", members: schema.schema };
        }

        // Primitives
        case "string": {
          return { ...opts, type: "string" };
        }
        case "number": {
          return { ...opts, type: "number" };
        }
        case "boolean": {
          return { ...opts, type: "boolean" };
        }
        case "symbol": {
          return { ...opts, type: "symbol" };
        }
        case "undefined": {
          return { ...opts, type: "undefined" };
        }
        case "null": {
          return { ...opts, type: "null" };
        }
        case "date": {
          return { ...opts, type: "date" };
        }
        case "any": {
          return { ...opts, type: "any" };
        }
      }

      return { ...opts, type: "unknown" };
    },
  };
};

export const SuperstructFormatter =
  (): SchemaFormatter<AnySuperstructSchema> => {
    return {
      format(def) {
        let s: AnySuperstructSchema;

        switch (def.type) {
          case "string": {
            s = S.string();
            break;
          }
          case "number": {
            s = S.number();
            break;
          }
          case "boolean": {
            s = S.boolean();
            break;
          }
          case "date": {
            s = S.date();
            break;
          }
          case "any": {
            s = S.any();
            break;
          }

          // Containers
          case "object": {
            s = S.object(def.properties);
            break;
          }
          case "array": {
            s = S.array(def.element);
            break;
          }
          case "function": {
            s = S.func();
            break;
          }
          case "enum": {
            s = S.enums(Object.values(def.members));
            break;
          }
          case "intersection": {
            const [first, ...rest] = def.members;
            s = S.intersection([first, ...rest]);
            break;
          }
          case "union": {
            const [first, ...rest] = def.members;
            s = S.union([first, ...rest]);
            break;
          }
          case "tuple": {
            const [first, ...rest] = def.entries;
            s = S.tuple([first, ...rest]);
            break;
          }
        }

        s ??= S.unknown();

        if (def.nullable) {
          s = S.nullable(s);
        }

        if (def.optional) {
          s = S.optional(s);
        }

        if (def.default_) {
          s = S.defaulted(s, def.default_);
        }

        return s;
      },
    };
  };

export const SuperstructDiscriminator =
  (): SchemaDiscriminator<AnySuperstructSchema> => {
    return {
      isSchema: (schema): schema is AnySuperstructSchema =>
        typeof schema === "object" && "refiner" in schema,
    };
  };

export const SuperstructJsonSchemaFormatter = () =>
  createJsonSchemaFormatter(SupertstructParser());
