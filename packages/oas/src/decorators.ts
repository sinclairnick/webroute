import {
  SchemaConfig,
  OASDecoratedSchema,
  $Schema,
  OASDecoratedParam,
  $Param,
  RequestBodyConfig,
  OASDecoratedRequestBody,
  $Body,
  ResponsesConfig,
  OASDecoratedResponse,
  $Response,
  OperationConfig,
  OASDecoratedOperation,
  $Operation,
  ParamConfigMap,
} from "./types";

export namespace OAS {
  /**
   * Decorates a schema object with the provided OAS config.
   */
  export const Schema = <T extends object>(
    input: T,
    config?: SchemaConfig<T>
  ): OASDecoratedSchema<T> => {
    return Object.assign(input, { [$Schema]: config });
  };

  /**
   * Decorates a schema object with the provided OAS config.
   */
  export const Param = <T extends object>(
    input: T,
    config?: ParamConfigMap<T>
  ): OASDecoratedParam<T> => {
    return Object.assign(input, { [$Param]: config });
  };

  /**
   * Decorates a schema object with the provided OAS config.
   */
  export const Body = <T extends object>(
    input: T,
    config?: RequestBodyConfig
  ): OASDecoratedRequestBody<T> => {
    return Object.assign(input, { [$Body]: config });
  };

  /**
   * Decorates a schema object with the provided OAS config.
   */
  export const Response = <T extends object>(
    input: T,
    config?: ResponsesConfig
  ): OASDecoratedResponse<T> => {
    return Object.assign(input, { [$Response]: config });
  };

  /**
   * Decorates an operation with the provided OAS config.
   */
  export const Operation = <T extends object>(
    input: T,
    config?: OperationConfig
  ): OASDecoratedOperation<T> => {
    return Object.assign(input, { [$Operation]: config });
  };
}

/**
 * Retrieves any schema config from a schema object.
 */
export const getSchemaConfig = (
  schema: any
): SchemaConfig<unknown> | undefined => {
  if (typeof schema !== "object" || schema == null) return;
  return schema[$Schema];
};

/**
 * Retrieves any param config from a schema object.
 */
export const getParamConfig = (
  param: any
): ParamConfigMap<Record<string, unknown>> | undefined => {
  if (typeof param !== "object" || param == null) return;
  return param?.[$Param];
};

/**
 * Retrieves any body config from a schema object.
 */
export const getBodyConfig = (body: any): RequestBodyConfig | undefined => {
  if (typeof body !== "object" || body == null) return;
  return body?.[$Body];
};

/**
 * Retrieves any responses config from a schema object.
 */
export const getResponsesConfig = (
  response: any
): ResponsesConfig | undefined => {
  if (typeof response !== "object" || response == null) return;
  return response?.[$Response];
};

/**
 * Retrieves any operation config from an operation.
 */
export const getOperationConfig = (op: any): OperationConfig | undefined => {
  if (typeof op !== "object" || op == null) return;
  return op?.[$Operation];
};
