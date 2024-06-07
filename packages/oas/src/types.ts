import type { oas31 } from "openapi3-ts";
import type { InferIn } from "@webroute/schema";

export const $Schema = Symbol("OAS_Schema");
export const $Param = Symbol("OAS_Param");
export const $Body = Symbol("OAS_Body");
export const $Response = Symbol("OAS_Response");
export const $Operation = Symbol("OAS_Operation");
export const $Skip = Symbol("OAS_Skip");

export type SchemaFormatter<T> = (schema: T) => oas31.SchemaObject;

// Decorated
export type OASDecoratedSchema<T> = T & { [$Schema]?: SchemaConfig<T> };
export type OASDecoratedParam<T> = T & { [$Param]?: ParamConfigMap<any> };
export type OASDecoratedRequestBody<T> = T & { [$Body]?: RequestBodyConfig };
export type OASDecoratedResponse<T> = T & { [$Response]?: ResponsesConfig };
export type OASDecoratedOperation<T> = T & { [$Operation]?: OperationConfig };
export type OASDecoratedSkip<T> = T & { [$Skip]?: boolean };

export type ConfigFn<T> = (config: T, schema: oas31.SchemaObject) => T;

// Schema config
export type SchemaConfigObject<T> = Omit<oas31.SchemaObject, "schema"> & {
  id?: string;
};
export type SchemaConfig<T> =
  | SchemaConfigObject<T>
  | ((schema: oas31.SchemaObject) => oas31.SchemaObject);

// Param config
export type ParamConfigObject = Omit<oas31.ParameterObject, "schema" | "in">;
export type ParamConfig = ParamConfigObject | ConfigFn<oas31.ParameterObject>;
export type ParamConfigMap<T> = Partial<{
  [key in keyof InferIn<T> | (string & {})]: ParamConfig;
}>;

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
  | ((operation: oas31.OperationObject) => oas31.OperationObject);
