import { Express } from "express";
import { oas31 } from "openapi3-ts";
import { discoverRoutes } from "../route";
import { getJsonSchema } from "./schema";
import { isCompiledRoute } from "../route/handler/util";
import { Debug } from "../debug";

export const createOpenApiSpec = (app: Express) => {
  let builder = new oas31.OpenApiBuilder();

  const routes = discoverRoutes(app);

  for (const route of routes) {
    Debug.openapi(`Adding route to spec:`, route.method, route.path);

    const config: oas31.OperationObject = {
      parameters: [],
      responses: {
        default: {
          description: "Default response",
        },
      },
    };

    if (isCompiledRoute(route.handler)) {
      Debug.openapi("Is compiled route.");

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
            default: {
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

          config.parameters?.push({
            in: "path",
            name: "PathParams",
            schema: asJson,
          });
        }
      }

      if (query) {
        const asJson = getJsonSchema(query);
        if (asJson) {
          Debug.openapi("Adding query params.");

          config.parameters?.push({
            in: "query",
            name: "QueryParams",
            schema: asJson,
          });
        }
      }
    }

    builder.addPath(route.path ?? "", {
      [route.method]: config,
    });
  }

  return builder;
};
