import type { oas31 } from "openapi3-ts";
import { SchemaParser, createParser } from "../parser/parser";
import { toJsonSchema } from "./json-schema";
import { SchemaStore } from "./store";
import { ZodParser } from "./zod";
import { z } from "zod";

export type ValidatorConfig = {
  id?: string;
  schema: any;
};

/**
 * An immutable operation builder utility for
 * building OpenAPI operations, given a validation schema parser.
 */
export class OperationBuilder {
  private op: oas31.OperationObject = {};
  private parser: ReturnType<typeof createParser<any>>;

  constructor(
    schemaParser: SchemaParser<any, any>,
    private store = new SchemaStore(),
    initialOp?: oas31.OperationObject
  ) {
    this.parser = createParser(schemaParser);

    if (initialOp) {
      this.op = initialOp;
    }
  }

  /**
   * Appends a path param to the list of params.
   */
  withParams = (config: Omit<ValidatorConfig, "id">): OperationBuilder => {
    const parameters = [...(this.op.parameters ?? [])];
    const parsed = this.parser.parse(config.schema);
    const schema = toJsonSchema(parsed);

    for (const key in schema.properties) {
      const value = schema.properties[key];

      parameters.push({
        schema: value,
        name: key,
        in: "path",
      });
    }

    return { ...this, op: { ...this.op, parameters } };
  };

  /**
   * Appends a query param to the list of parameters.
   */
  withQuery = (config: Omit<ValidatorConfig, "id">): OperationBuilder => {
    const parameters = [...(this.op.parameters ?? [])];
    const parsed = this.parser.parse(config.schema);
    const schema = toJsonSchema(parsed);

    for (const key in schema.properties) {
      const value = schema.properties[key];

      parameters.push({
        schema: value,
        name: key,
        in: "query",
      });
    }

    return { ...this, op: { ...this.op, parameters } };
  };

  /**
   * Appends a header to the list of parameters.
   */
  withHeaders = (config: Omit<ValidatorConfig, "id">): OperationBuilder => {
    const parameters = [...(this.op.parameters ?? [])];
    const parsed = this.parser.parse(config.schema);
    const schema = toJsonSchema(parsed);

    for (const key in schema.properties) {
      const value = schema.properties[key];

      parameters.push({
        schema: value,
        name: key,
        in: "header",
      });
    }

    return { ...this, op: { ...this.op, parameters } };
  };

  /**
   * Appends a request body to the operation.
   *
   * Existing bodies of the same content type are overwritten.
   */
  withBody = (
    config: ValidatorConfig & {
      contentType?: string;
    }
  ): OperationBuilder => {
    const { contentType = "application/json" } = config;

    const parsed = this.parser.parse(config.schema);
    const schema = toJsonSchema(parsed);

    return {
      ...this,
      op: {
        ...this.op,
        requestBody: {
          content: {
            ...(this.op.requestBody
              ? "content" in this.op.requestBody
                ? this.op.requestBody.content
                : {}
              : {}),
            [contentType]: {
              schema: this.store.put(schema, config.id),
            },
          },
        },
      },
    };
  };

  /**
   * Append a response to the operation.
   *
   * Existing responses with the same status and content type are overwritten.
   */
  withResponse = (
    config: ValidatorConfig & {
      status?: number;
      contentType?: string;
      description?: string;
    }
  ): OperationBuilder => {
    const {
      status = 200,
      contentType = "application/json",
      description = "Success response",
    } = config;

    const parsed = this.parser.parse(config.schema);
    const schema = toJsonSchema(parsed);

    const response: oas31.ResponseObject = {
      description,
      content: {
        [contentType]: {
          schema: this.store.put(schema, config.id),
        },
      },
    };

    return {
      ...this,
      op: {
        ...this.op,
        responses: {
          ...this.op.responses,
          [status]: {
            ...this.op.responses?.[status],
            ...response,
            content: {
              ...this.op.responses?.[status].content,
              ...response.content,
            },
          },
        },
      },
    };
  };

  get() {
    return this.op;
  }
}

const op = new OperationBuilder(ZodParser());

op.withBody({ schema: z.object({}) }).get();
