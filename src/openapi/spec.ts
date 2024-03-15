import { Express } from "express";
import { oas31 } from "openapi3-ts";
import { discoverRoutes } from "../route";
import { getJsonSchema } from "./schema";
import { isCompiledRoute } from "../route/handler/util";
import { Debug } from "../debug";
import * as Formatting from "./formatting";

export type CreateOpenApiSpecOptions = {
  deriveOperationId?: (input: Formatting.DeriveOperationIdInput) => string;
};

export const createOpenApiSpec = (
  app: Express,
  opts?: CreateOpenApiSpecOptions
) => {
  const { deriveOperationId = Formatting.deriveOperationId } = opts ?? {};

  let builder = new oas31.OpenApiBuilder();

  const routes = discoverRoutes(app);

  const opIdBank = new Formatting.OperationIdBank();

  for (const route of routes) {
    Debug.openapi(`Adding route to spec:`, route.method, route.path);

    let config: oas31.OperationObject = {
      parameters: [],
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {},
          },
        },
      },
    };

    if (isCompiledRoute(route.handler)) {
      const routeName = route.handler._def.meta?.name;
      config.operationId = opIdBank.getUniqueId(
        deriveOperationId({
          method: route.method,
          path: route.path ?? "/",
          name: routeName,
        })
      );
      Debug.openapi("Is compiled route. Name=", routeName ?? "Undefined");

      const { body, output, params, query } = route.handler._def;

      Debug.openapi("Has parts", {
        body: body != null,
        output: output != null,
        params: params != null,
        query: query != null,
      });

      if (body) {
        const asJson = getJsonSchema(body);
        if (asJson) {
          Debug.openapi("Adding request body.");

          config.requestBody = {
            required: true,
            content: {
              "application/json": {
                schema: asJson,
              },
            },
          };
        }
      }

      if (output) {
        const asJson = getJsonSchema(output);
        if (asJson) {
          Debug.openapi("Adding response type.");

          config.responses = {
            "200": {
              description: "Success",
              content: {
                "application/json": {
                  schema: asJson,
                },
              },
            },
          };
        }
      }

      if (params) {
        const asJson = getJsonSchema(params);
        if (asJson) {
          Debug.openapi("Adding path params.");

          const requiredSet = new Set(asJson.required);

          for (const key in asJson.properties ?? {}) {
            config.parameters?.push({
              in: "path",
              name: key,
              schema: asJson.properties?.[key],
              required: requiredSet.has(key),
            });
          }
        }
      }

      if (query) {
        const asJson = getJsonSchema(query);
        if (asJson) {
          Debug.openapi("Adding query params.");

          const requiredSet = new Set(asJson.required);

          for (const key in asJson.properties ?? {}) {
            config.parameters?.push({
              in: "query",
              name: key,
              schema: asJson.properties?.[key],
              required: requiredSet.has(key),
            });
          }
        }
      }

      const userOpenApiConfig = route.handler._def.meta?.openApi;
      if (userOpenApiConfig != null) {
        if (typeof userOpenApiConfig === "function") {
          config = userOpenApiConfig(config);
        } else {
          config = { ...config, ...userOpenApiConfig };
        }
      }
    } else {
      config.operationId = opIdBank.getUniqueId(
        deriveOperationId({
          method: route.method,
          path: route.path ?? "/",
        })
      );
    }

    const formattedPath = Formatting.formatPath(route.path ?? "/");
    builder.addPath(formattedPath, { [route.method]: config });
  }

  return builder;
};