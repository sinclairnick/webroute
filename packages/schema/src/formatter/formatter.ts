import { SchemaDef } from "../def/schema-def";
import { InferFormatterSchemaAny, SchemaFormatter } from "./types";

export const createFormatter = <TFormatter extends SchemaFormatter<any>>(
  formatter: TFormatter
) => {
  const format = (def: SchemaDef): InferFormatterSchemaAny<TFormatter> => {
    let schema: any;

    switch (def.type) {
      // Specifically handle container types
      case "object": {
        const properties: Record<PropertyKey, any> = {};

        for (const key in def.properties ?? {}) {
          properties[key] = format(def.properties[key]);
        }

        schema = formatter.format({ ...def, properties });

        break;
      }
      case "array": {
        const element: any = format(def.element);

        schema = formatter.format({ ...def, element });
        break;
      }
      case "tuple": {
        const entries: any[] = def.entries.map(format);

        schema = formatter.format({ ...def, entries });
        break;
      }
      case "union": {
        const members: any[] = def.members.map(format);

        schema = formatter.format({ ...def, members });
        break;
      }
      case "intersection": {
        const members: any[] = def.members.map(format);

        schema = formatter.format({ ...def, members });
        break;
      }
      case "function": {
        const parameters = def.parameters?.map(formatter.format);
        const result = def.result ? formatter.format(def.result) : undefined;

        schema = formatter.format({ ...def, parameters, result });
        break;
      }
    }

    schema ??= formatter.format(def);

    return schema;
  };

  return { format };
};
