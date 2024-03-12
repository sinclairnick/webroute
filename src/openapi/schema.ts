import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ParseFn } from "../route/parser";
import { Parser } from "../route/parser/types";
import { Debug } from "../debug";

export const getJsonSchema = ({
  schema,
}: {
  parser: ParseFn<unknown>;
  schema: Parser;
}) => {
  if (schema instanceof ZodSchema) {
    Debug.openapi("Is zod schema.");
    return zodToJsonSchema(schema);
  }

  Debug.openapi("No json schema formatter found");
};
