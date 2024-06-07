import { oas31 } from "openapi3-ts";
import { DeriveOperationIdFn } from "../util";
import { SchemaFormatter } from "../types";

export type AnySchemaEsque = Record<any, any>;

export type SchemaRecord = {
  Query?: AnySchemaEsque;
  Params?: AnySchemaEsque;
  Headers?: AnySchemaEsque;
  Body?: AnySchemaEsque;
  Output?: AnySchemaEsque;
};

export type OperationsArrayInput = ({
  path: string;
  methods: string[];
} & SchemaRecord)[];

export type OperationsRecordInput = {
  [key: string]: SchemaRecord;
};

export type CreateSpecOptions = {
  /**
   * A function which converts a given schema into a JSON/OAS Schema definition.
   *
   * Formatters for most popular schema libraries can be found in the `@webroute/schema` package.
   */
  formatter?: SchemaFormatter<any>;

  /**
   * An existing OpenAPI spec builder to extend from.
   */
  spec?: oas31.OpenApiBuilder;

  /**
   * Called when there are duplicate operations found
   */
  onCollision?: (input: {
    path: string;
    method: string;
    existing: oas31.OperationObject;
    attempted: oas31.OperationObject;
  }) => any;

  operation?: {
    /**
     * Derives an operation ID string for a given operation
     */
    deriveOperationId?: DeriveOperationIdFn;
  };

  body?: {
    /**
     * Omit request body definitions for invalid methods (get, delete)
     *
     * @default true
     */
    stripFromInvalidMethods?: boolean;
  };

  params?: {
    /**
     * Strips extraneous path parameters from parameter list.
     */
    stripExtraneous?: boolean;

    /**
     * Appends any missing path params.
     */
    appendMissing?: boolean;
  };
};
