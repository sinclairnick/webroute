import { oas31 } from "openapi3-ts";
import {
  OASDecoratedParam,
  OASDecoratedRequestBody,
  OASDecoratedResponse,
  OASDecoratedSchema,
  OperationConfig,
  RequestBodyConfig,
  ResponsesConfig,
  SchemaConfig,
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

type FormatCtx = {
  formatter: SchemaFormatter<any>;
  store: SchemaStore;
};

const formatSchema = (schema: OASDecoratedSchema<unknown>, ctx: FormatCtx) => {
  const config: SchemaConfig<unknown> | undefined = getSchemaConfig(schema);
  const jsonSchema = schema ? ctx.formatter(schema) : {};

  if (typeof config === "function") {
    return config(jsonSchema);
  }

  const { id, ...rest } = config ?? {};

  return ctx.store.put({ ...jsonSchema, ...rest }, id);
};

const formatParameter = (
  type: oas31.ParameterObject["in"],
  param: OASDecoratedParam<OASDecoratedSchema<unknown>>,
  ctx: FormatCtx
): oas31.ParameterObject => {
  const config = getParamConfig(param);
  const initial: oas31.ParameterObject = {
    in: type,
    explode: true,
    schema: formatSchema(param, ctx),
    // TODO: Sort out name?
    name: "",
  };

  if (typeof config === "function") {
    return config(initial);
  }

  return { ...initial, ...config };
};

const formatBody = (
  body: OASDecoratedRequestBody<OASDecoratedSchema<unknown>>,
  ctx: FormatCtx
): oas31.RequestBodyObject => {
  const config: RequestBodyConfig | undefined = getBodyConfig(body);
  const initial: oas31.RequestBodyObject = {
    content: {
      "application/json": {
        schema: formatSchema(body, ctx),
      },
    },
  };

  if (typeof config === "function") {
    return config(initial);
  }

  return { ...initial, ...config };
};

const formatResponses = (
  response: OASDecoratedResponse<OASDecoratedSchema<unknown>>,
  ctx: FormatCtx
): oas31.ResponsesObject => {
  const config: ResponsesConfig | undefined = getResponsesConfig(response);

  if (typeof config === "function") {
    return config({
      "200": {
        content: {
          "application/json": {
            schema: formatSchema(response, ctx),
          },
        },
      },
    });
  }

  const initial: oas31.ResponsesObject = {};
  const statuses = Array.isArray(config?.status)
    ? config.status
    : [config?.status ?? 200];
  const contentTypes = Array.isArray(config?.contentType)
    ? config.contentType
    : [config?.contentType ?? "application/json"];
  const schema = formatSchema(response, ctx);

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

  return { ...initial, ...config };
};

export const createOperation = (
  schemas: SchemaRecord,
  ctx: FormatCtx
): oas31.OperationObject => {
  const config: OperationConfig | undefined = getOperationConfig(schemas);

  // Setup parameters
  const parameters: oas31.ParameterObject[] = [];

  if (schemas.Query) {
    parameters.unshift(formatParameter("query", schemas.Query, ctx));
  }
  if (schemas.Params) {
    parameters.unshift(formatParameter("path", schemas.Params, ctx));
  }
  if (schemas.Headers) {
    parameters.unshift(formatParameter("header", schemas.Headers, ctx));
  }

  // Setup body
  let body: oas31.RequestBodyObject = {
    content: {},
  };
  if (schemas.Body) {
    body = formatBody(schemas.Body, ctx);
  }

  // Setup response
  let responses: oas31.ResponsesObject = {};
  if (schemas.Output) {
    responses = formatResponses(schemas.Output, ctx);
  }

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
