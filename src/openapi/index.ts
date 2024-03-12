import { Express } from "express";
import { oas31 } from "openapi3-ts";
import { discoverRoutes } from "../route";
import { getJsonSchema } from "./schema";
import { isCompiledRoute } from "../route/handler/util";

export const createOpenApiSpec = (app: Express) => {
  let builder = new oas31.OpenApiBuilder();

  const routes = discoverRoutes(app);

  for (const route of routes) {
    const config: oas31.OperationObject = {
      parameters: [],
    };

    if (isCompiledRoute(route.handler)) {
      const { body, output, params, query } = route.handler._def;

      if (body) {
        const asJson = getJsonSchema(body);
        if (asJson) {
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
