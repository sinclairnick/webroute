import { createFormatter } from "./formatter/formatter";
import { createParser } from "./parser/parser";
import { SchemaParser } from "./parser/types";
import { TypeBoxFormatter } from "./validators/typebox";

export const createJsonSchemaFormatter = (schemaParser: SchemaParser<any>) => {
  const parser = createParser(schemaParser);
  const formatter = createFormatter(TypeBoxFormatter());

  return (schema: unknown) => {
    return formatter.format(parser.parse(schema));
  };
};
