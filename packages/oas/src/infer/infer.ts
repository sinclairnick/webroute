import { oas31 } from "openapi3-ts";
import type {
  Simplify,
  Defaulted,
  UnionToIntersection,
  FormatOptionals,
} from "@webroute/common";

export type SchemaObjectOrRef = oas31.SchemaObject | oas31.ReferenceObject;
export type BodyObjectOrRef = oas31.RequestBodyObject | oas31.ReferenceObject;
export type ResponseObjectOrRef = oas31.ResponseObject | oas31.ReferenceObject;

/**
 * Parses an OAS union type.
 */
export type ParseUnion<
  T extends oas31.SchemaObject,
  TRef extends oas31.ComponentsObject
> = T["anyOf"] extends [
  infer $Head extends SchemaObjectOrRef,
  ...infer $Tail extends SchemaObjectOrRef[]
]
  ? ParseSchema<$Head, TRef> | ParseUnion<{ anyOf: $Tail }, TRef>
  : never; // If this is `unknown` it breaks the union

/**
 * Parses an OAS intersection type.
 */
export type ParseIntersection<
  T extends oas31.SchemaObject,
  TRef extends oas31.ComponentsObject
> = T["allOf"] extends [
  infer $Head extends SchemaObjectOrRef,
  ...infer $Tail extends SchemaObjectOrRef[]
]
  ? ParseSchema<$Head, TRef> & ParseSchema<{ allOf: $Tail }, TRef>
  : unknown; // If this is `never` then it breaks intersection

/**
 * Parses an OAS object type.
 */
export type ParseObject<
  T extends oas31.SchemaObject,
  TRef extends oas31.ComponentsObject
> = T["properties"] extends Record<string, unknown>
  ? Simplify<
      {
        [Key in keyof T["properties"]]?: ParseSchema<
          T["properties"][Key],
          TRef
        >;
      } & {
        [Key in T["required"][keyof T["required"]] &
          keyof T["properties"]]: ParseSchema<T["properties"][Key], TRef>;
      }
    >
  : {};

/**
 * Parses an OAS array type.
 *
 * To avoid excessively deep types, array modifiers like min/max length
 * are ignored.
 */
export type ParseArray<
  T extends oas31.SchemaObject,
  TRef extends oas31.ComponentsObject
> = T["items"] extends oas31.SchemaObject
  ? ParseSchema<T["items"], TRef>[]
  : unknown[];

/**
 * Parses an OAS string type.
 */
export type ParseString<T extends oas31.SchemaObject> = T["enum"] extends any[]
  ? T["enum"] extends [
      infer $Head extends string,
      ...infer $Tail extends string[]
    ]
    ? $Head | ParseString<{ enum: $Tail }>
    : never
  : string;

export type ParseBoolean<T extends oas31.SchemaObject> = boolean;

export type ParseNumber<T extends oas31.SchemaObject> = number;

export type ParseNull<T extends oas31.SchemaObject> = null;

/**
 * Parses an OAS schema object to it's TypeScript counterpart.
 */
type ParseSchemaObject<
  T extends oas31.SchemaObject,
  TRef extends oas31.ComponentsObject
> = T["type"] extends "string"
  ? ParseString<T>
  : T["type"] extends "number" | "integer"
  ? ParseNumber<T>
  : T["type"] extends "boolean"
  ? ParseBoolean<T>
  : T["type"] extends "null"
  ? ParseNull<T>
  : T["type"] extends "object"
  ? ParseObject<T, TRef>
  : T["type"] extends "array"
  ? ParseArray<T, TRef>
  : T["anyOf"] extends {}
  ? ParseUnion<T, TRef>
  : T["allOf"] extends {}
  ? ParseIntersection<T, TRef>
  : unknown;

/**
 * Parses an OAS schema reference to it's (dereferenced) TypeScript counterpart.
 */
export type ParseSchemaReference<
  T extends oas31.ReferenceObject,
  TRef extends oas31.ComponentsObject
> = T["$ref"] extends `#/components/schemas/${infer $Name}`
  ? TRef["schemas"] extends {
      [Key in $Name]: infer $Value extends SchemaObjectOrRef;
    }
    ? ParseSchema<$Value, TRef>
    : unknown
  : unknown;

/**
 * Parses an OAS schema object or reference to it's TypeScript counterpart.
 */
export type ParseSchema<
  T extends SchemaObjectOrRef,
  TRef extends oas31.ComponentsObject
> = T extends oas31.ReferenceObject
  ? ParseSchemaReference<T, TRef>
  : T extends oas31.SchemaObject
  ? ParseSchemaObject<T, TRef>
  : unknown;

type FormatIn<T extends string> = T extends "path"
  ? "Params"
  : T extends "header"
  ? "Headers"
  : Capitalize<T>;

/**
 * Parses a single OAS parameter reference.
 */
export type ParseParameterReference<
  T extends oas31.ReferenceObject,
  TRef extends oas31.ComponentsObject
> = T["$ref"] extends `#/components/parameters/${infer $Name}`
  ? TRef["parameters"] extends {
      [Key in $Name]: infer $Value extends oas31.ParameterObject;
    }
    ? ParseParameterObject<$Value, TRef>
    : {}
  : {};

/**
 * Parses a single OAS parameter object.
 */
export type ParseParameterObject<
  T extends oas31.ParameterObject,
  TRef extends oas31.ComponentsObject
> = {
  [Key in FormatIn<T["in"]>]: T["schema"] extends SchemaObjectOrRef
    ? T["required"] extends true
      ? {
          [Key in T["name"]]: ParseSchema<T["schema"], TRef>;
        }
      : {
          [Key in T["name"]]?: ParseSchema<T["schema"], TRef>;
        }
    : {};
};

/**
 * Parses a single OAS parameter.
 */
export type ParseParameter<
  T extends oas31.ParameterObject | oas31.ReferenceObject,
  TRef extends oas31.ComponentsObject
> = T extends oas31.ReferenceObject
  ? ParseParameterReference<T, TRef>
  : T extends oas31.ParameterObject
  ? ParseParameterObject<T, TRef>
  : {};

export type AnyParsedParams = {
  Headers?: unknown;
  Params?: unknown;
  Query?: unknown;
};

/**
 * Parses an OAS parameters array.
 */
export type ParseParameters<
  T extends (oas31.ParameterObject | oas31.ReferenceObject)[] | undefined,
  TRef extends oas31.ComponentsObject,
  TParsed extends AnyParsedParams = AnyParsedParams
> = T extends [
  infer $Head extends oas31.ParameterObject | oas31.ReferenceObject,
  ...infer $Tail extends (oas31.ParameterObject | oas31.ReferenceObject)[]
]
  ? ParseParameters<
      $Tail,
      TRef,
      ParseParameter<$Head, TRef> & AnyParsedParams
    > extends infer $Parsed extends AnyParsedParams
    ? {
        Headers: $Parsed["Headers"] & TParsed["Headers"];
        Params: $Parsed["Params"] & TParsed["Params"];
        Query: $Parsed["Query"] & TParsed["Query"];
      }
    : {}
  : {
      Headers: TParsed["Headers"];
      Params: TParsed["Params"];
      Query: TParsed["Query"];
    };

/**
 * Parses the schema corresponding to an OAS body or response reference.
 */
export type ParseBodyOrResponseReference<
  T extends oas31.ReferenceObject,
  TType extends "responses" | "requestBodies",
  TRef extends oas31.ComponentsObject
> = T["$ref"] extends `#/components/${TType}/${infer $Name}`
  ? $Name extends keyof TRef[TType]
    ? TRef[TType][$Name] extends {
        content: {
          [key: string]: {
            schema: infer $Schema extends SchemaObjectOrRef;
          };
        };
      }
      ? ParseSchema<$Schema, TRef>
      : never
    : never
  : never;

/**
 * Parses the schema corresponding to an OAS body or response object.
 */
export type ParseBodyOrResponseObject<
  T extends oas31.RequestBodyObject | oas31.ResponseObject,
  TRef extends oas31.ComponentsObject
> = T extends {
  content: {
    [key: string]: { schema: infer $Schema extends SchemaObjectOrRef };
  };
}
  ? ParseSchema<$Schema, TRef>
  : never;

/**
 * Parses a single request body object of an OAS definition.
 */
export type ParseBody<
  T extends BodyObjectOrRef | undefined,
  TRef extends oas31.ComponentsObject
> = T extends oas31.ReferenceObject
  ? ParseBodyOrResponseReference<T, "requestBodies", TRef>
  : T extends oas31.RequestBodyObject
  ?
      | ParseBodyOrResponseObject<T, TRef>
      | (T["required"] extends true ? never : undefined)
  : unknown;

/**
 * Parses a single response object of an OAS definition.
 */
export type ParseResponse<
  T extends ResponseObjectOrRef,
  TRef extends oas31.ComponentsObject
> = T extends oas31.ReferenceObject
  ? ParseBodyOrResponseReference<T, "responses", TRef>
  : T extends oas31.ResponseObject
  ? ParseBodyOrResponseObject<T, TRef>
  : {};

/**
 * Parses a responses object of an OAS definition.
 */
export type ParseResponses<
  T extends oas31.ResponsesObject | undefined,
  TRef extends oas31.ComponentsObject
> = T extends oas31.ResponsesObject
  ? keyof T extends infer $Key
    ? $Key extends `2${string}` // Only use success codes
      ? ParseResponse<T[$Key], TRef>
      : never
    : never
  : never;

/**
 * Parses a single operation of an OAS definition.
 */
export type ParseOperation<
  T extends oas31.OperationObject,
  TRef extends oas31.ComponentsObject
> = FormatOptionals<
  {
    Output: ParseResponses<T["responses"], TRef>;
    Body: ParseBody<T["requestBody"], TRef>;
  } & ParseParameters<T["parameters"], TRef>
>;

/**
 * Parses a single path of an OAS definition.
 */
export type ParsePath<
  T extends oas31.OpenAPIObject,
  TPath extends keyof T["paths"]
> = {
  [Method in keyof T["paths"][TPath] as `${Uppercase<Method & string>} ${TPath &
    string}`]: T["paths"][TPath][Method] extends infer $Operation extends oas31.OperationObject
    ? ParseOperation<$Operation, Defaulted<T["components"], {}>>
    : {};
};

/**
 * Parses an OAS definition from it's type declaration.
 *
 * Note: this requires the spec be placed into a `.d.ts` file
 * to achieve the necessary type strictness.
 */
export type ParseSpec<T extends oas31.OpenAPIObject> = Simplify<
  UnionToIntersection<
    {
      [Path in keyof T["paths"]]: ParsePath<T, Path>;
    }[keyof T["paths"]]
  >
>;
