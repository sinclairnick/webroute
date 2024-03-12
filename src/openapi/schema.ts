import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ParseFn } from "../route/parser";
import { Parser } from "../route/parser/types";

export const getJsonSchema = ({
  schema,
}: {
  parser: ParseFn<unknown>;
  schema: Parser;
}) => {
  if (schema instanceof ZodSchema) {
    return zodToJsonSchema(schema);
  }
};
