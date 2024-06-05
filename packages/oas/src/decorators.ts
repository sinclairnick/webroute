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
} from "./types";

export namespace OAS {
  export const Schema = <T extends object>(
    input: T,
    config?: SchemaConfig<T>
  ): OASDecoratedSchema<T> => {
    return Object.assign(input, {
      [$Schema]: config,
    });
  };

  export const Param = <T extends object>(
    input: T,
    config?: ParamConfig
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

export const getSchemaConfig = (schema: OASDecoratedSchema<any>) => {
  return schema[$Schema];
};

export const getParamConfig = (schema: OASDecoratedParam<any>) => {
  return schema[$Param];
};

export const getBodyConfig = (schema: OASDecoratedRequestBody<any>) => {
  return schema[$Body];
};

export const getResponsesConfig = (schema: OASDecoratedResponse<any>) => {
  return schema[$Response];
};

export const getOperationConfig = (schema: OASDecoratedOperation<any>) => {
  return schema[$Operation];
};
