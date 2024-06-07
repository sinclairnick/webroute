import { oas31 } from "openapi3-ts";
import {
  OASDecoratedParam,
  OASDecoratedRequestBody,
  OASDecoratedResponse,
  OASDecoratedSchema,
  SchemaFormatter,
} from "../types";
import {
  getBodyConfig,
  getOperationConfig,
  getParamConfig,
  getResponsesConfig,
  getSchemaConfig,
} from "../decorators";
import { SchemaRecord } from "./types";
import { SchemaStore } from "./store";
import { getPathParams } from "../util";

type FormatCtx = {
  formatter: SchemaFormatter<any>;
  store: SchemaStore;
};

const formatSchema = (
  schema: OASDecoratedSchema<unknown> | undefined,
  ctx: FormatCtx
) => {
  const config = getSchemaConfig(schema);
  const jsonSchema = schema ? ctx.formatter(schema) : {};

  if (typeof config === "function") {
    return config(jsonSchema);
  }

  const { id, ...rest } = config ?? {};

  return ctx.store.put({ ...jsonSchema, ...rest }, id);
};

const formatParameter = (
  type: oas31.ParameterObject["in"],
  param: OASDecoratedParam<OASDecoratedSchema<unknown>> | undefined,
  ctx: FormatCtx
): oas31.ParameterObject[] => {
  const config = getParamConfig(param);
  const schema = formatSchema(param, ctx);

  if ("$ref" in schema) {
    // TODO: How to handle this better?
    console.warn("Parameter is reference type. Noop");
    return [];
  }

  if (schema.type !== "object") {
    console.warn(`Schema is not object type. Unable to parse ${type} params.`);
    return [];
  }

  const parameters: oas31.ParameterObject[] = [];

  for (const prop in schema.properties) {
    const value = schema.properties[prop];
    const propConfig = config?.[prop];

    const initial: oas31.ParameterObject = {
      in: type,
      name: prop,
      schema: value,
      required: type === "path",
    };

    if (typeof propConfig === "function") {
      parameters.push(propConfig(initial, value));
      continue;
    }

    parameters.push({ ...initial, ...propConfig });
  }

  return parameters;
};

const formatBody = (
  body: OASDecoratedRequestBody<OASDecoratedSchema<unknown>> | undefined,
  ctx: FormatCtx
): oas31.RequestBodyObject => {
  const schema = formatSchema(body, ctx);
  const config = getBodyConfig(body);

  if (typeof config === "function") {
    return config(
      {
        content: { "application/json": { schema } },
      },
      schema
    );
  }

  const { contentType, ...rest } = config ?? {};

  const initial: oas31.RequestBodyObject = {
    content: {},
  };
  const _contentType = Array.isArray(contentType)
    ? contentType
    : [contentType ?? "application/json"];

  for (const type of _contentType) {
    initial.content[type] = { schema };
  }

  return { ...initial, ...rest };
};

const formatResponses = (
  response: OASDecoratedResponse<OASDecoratedSchema<unknown>> | undefined,
  ctx: FormatCtx
): oas31.ResponsesObject => {
  const config = getResponsesConfig(response);
  const schema = formatSchema(response, ctx);

  if (typeof config === "function") {
    return config(
      {
        "200": {
          content: { "application/json": { schema } },
        },
      },
      schema
    );
  }

  const initial: oas31.ResponsesObject = {};

  const { status, contentType, ...rest } = config ?? {};

  const statuses = Array.isArray(status) ? status : [status ?? 200];
  const contentTypes = Array.isArray(contentType)
    ? contentType
    : [contentType ?? "application/json"];

  for (const status of statuses) {
    initial[`${status}`] = {
      description: "Successful operation",
      content: {},
    };

    for (const type of contentTypes) {
      initial[`${status}`].content[type] = {
        schema,
      };
    }
  }

  return { ...initial, ...rest };
};

export const createOperation = (
  schemas: SchemaRecord,
  ctx: FormatCtx
): oas31.OperationObject => {
  const config = getOperationConfig(schemas);

  // Setup parameters
  const parameters: oas31.ParameterObject[] = [];

  if (schemas.Query) {
    parameters.push(...formatParameter("query", schemas.Query, ctx));
  }
  if (schemas.Params) {
    parameters.push(...formatParameter("path", schemas.Params, ctx));
  }
  if (schemas.Headers) {
    parameters.push(...formatParameter("header", schemas.Headers, ctx));
  }

  // Setup body
  let body: oas31.RequestBodyObject = {
    content: {},
  };
  if (schemas.Body) {
    body = formatBody(schemas.Body, ctx);
  }

  // Setup response
  const responses = formatResponses(schemas.Output, ctx);

  const initial: oas31.OperationObject = {
    parameters,
    responses,
    requestBody: body,
  };

  if (typeof config === "function") {
    return config(initial);
  }

  return { ...initial, ...config };
};
