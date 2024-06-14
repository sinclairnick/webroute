import {
  SchemaConfig,
  OASDecoratedSchema,
  $Schema,
  ParamConfig,
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
  export const Schema = <T extends object>(
    input: T,
    config?: SchemaConfig<T>
  ): OASDecoratedSchema<T> => {
    return Object.assign(input, { [$Schema]: config });
  };

  export const Param = <T extends object>(
    input: T,
    config?: ParamConfigMap<T>
  ): OASDecoratedParam<T> => {
    return Object.assign(input, { [$Param]: config });
  };

  export const Body = <T extends object>(
    input: T,
    config?: RequestBodyConfig
  ): OASDecoratedRequestBody<T> => {
    return Object.assign(input, { [$Body]: config });
  };

  export const Response = <T extends object>(
    input: T,
    config?: ResponsesConfig
  ): OASDecoratedResponse<T> => {
    return Object.assign(input, { [$Response]: config });
  };

  export const Operation = <T extends object>(
    input: T,
    config?: OperationConfig
  ): OASDecoratedOperation<T> => {
    return Object.assign(input, { [$Operation]: config });
  };
}

export const getSchemaConfig = (
  schema: any
): SchemaConfig<unknown> | undefined => {
  if (typeof schema !== "object" || schema == null) return;
  return schema[$Schema];
};

export const getParamConfig = (
  param: any
): ParamConfigMap<Record<string, unknown>> | undefined => {
  if (typeof param !== "object" || param == null) return;
  return param?.[$Param];
};

export const getBodyConfig = (body: any): RequestBodyConfig | undefined => {
  if (typeof body !== "object" || body == null) return;
  return body?.[$Body];
};

export const getResponsesConfig = (
  response: any
): ResponsesConfig | undefined => {
  if (typeof response !== "object" || response == null) return;
  return response?.[$Response];
};

export const getOperationConfig = (op: any): OperationConfig | undefined => {
  if (typeof op !== "object" || op == null) return;
  return op?.[$Operation];
};
