import { SchemaDef } from "../typedef/types";
import { InferFormatterSchemaAny, SchemaFormatter } from "./types";

export const createFormatter = <TFormatter extends SchemaFormatter<any>>(
  formatter: TFormatter
) => {
  const format = (def: SchemaDef): InferFormatterSchemaAny<TFormatter> => {
    let schema: any;

    switch (def.type) {
      // Basic types
      case "any": {
        schema = formatter.formatAny?.(def);
        break;
      }
      case "number": {
        schema = formatter.formatNumber?.(def);
        break;
      }
      case "string": {
        schema = formatter.formatString?.(def);
        break;
      }
      case "boolean": {
        schema = formatter.formatBoolean?.(def);
        break;
      }
      case "null": {
        schema = formatter.formatNull?.(def);
        break;
      }
      case "undefined": {
        schema = formatter.formatUndefined?.(def);
        break;
      }
      case "symbol": {
        schema = formatter.formatSymbol?.(def);
        break;
      }

      // Container types
      case "object": {
        if (!formatter.formatObject) break;

        const entries: [string, any][] = def.entries.map(([key, val]) => [
          key,
          format(val),
        ]);

        schema = formatter.formatObject?.({ ...def, entries });

        break;
      }
      case "array": {
        if (!formatter.formatArray) break;

        const element: any = format(def.element);

        schema = formatter.formatArray?.({ ...def, element });
        break;
      }
      case "tuple": {
        if (!formatter.formatTuple) break;

        const entries: any[] = def.entries.map(format);

        schema = formatter.formatTuple?.({ ...def, entries });
        break;
      }
      case "union": {
        if (!formatter.formatUnion) break;

        const members: any[] = def.members.map(format);

        schema = formatter.formatUnion?.({ ...def, members });
        break;
      }
      case "intersection": {
        if (!formatter.formatIntersection) break;

        const members: any[] = def.members.map(format);

        schema = formatter.formatIntersection?.({ ...def, members });
        break;
      }
      case "function": {
        schema = formatter.formatFunction?.(def);
        break;
      }
    }

    schema ??= formatter.formatDefault(def);

    if (formatter.applyDecorators) {
      schema = formatter.applyDecorators(schema, {
        default_: def.default_,
        description: def.description,
        nullable: def.nullable,
        optional: def.optional,
      });
    }

    return schema;
  };

  return {
    format,
  };
};
