import type { oas31 } from "openapi3-ts";

export const $Schema = Symbol("OAS_Schema");
export const $Param = Symbol("OAS_Param");
export const $Body = Symbol("OAS_Body");
export const $Response = Symbol("OAS_Response");
export const $Operation = Symbol("OAS_Operation");

export type SchemaFormatter<T> = (schema: T) => oas31.SchemaObject;

// Decorated
export type OASDecoratedSchema<T> = T & {
  [$Schema]?: SchemaConfig<T>;
};
export type OASDecoratedParam<T> = T & { [$Param]?: ParamConfig };
export type OASDecoratedRequestBody<T> = T & { [$Body]?: RequestBodyConfig };
export type OASDecoratedResponse<T> = T & { [$Response]?: ResponsesConfig };
export type OASDecoratedOperation<T> = T & {
  [$Operation]?: OperationConfig;
};

export type ConfigFn<T> = (input: T) => T;

// Schema config
export type SchemaConfigObject<T> = Omit<oas31.SchemaObject, "schema"> & {
  id?: string;
};
export type SchemaConfig<T> =
  | SchemaConfigObject<T>
  | ConfigFn<oas31.SchemaObject>;

// Param config
export type ParamConfigObject = Omit<oas31.ParameterObject, "schema" | "in">;
export type ParamConfig = ParamConfigObject | ConfigFn<oas31.ParameterObject>;

// Body config
export type RequestBodyConfigObject = Omit<
  oas31.RequestBodyObject,
  "content"
> & {
  /**
   * @default `application/json`
   */
  contentType?: string | string[];
};
export type RequestBodyConfig =
  | RequestBodyConfigObject
  | ConfigFn<oas31.RequestBodyObject>;

// Response config
export type ResponsesConfigObject = Omit<oas31.ResponseObject, "content"> & {
  /**
   * @default `200`
   */
  status?: number | number[];
  /**
   * @default `application/json`
   */
  contentType?: string | string[];
};
export type ResponsesConfig =
  | ResponsesConfigObject
  | ConfigFn<oas31.ResponsesObject>;

// Operation config
export type OperationConfigObject = oas31.OperationObject;
export type OperationConfig =
  | OperationConfigObject
  | ConfigFn<oas31.OperationObject>;
