import { ParseSpec } from "@webroute/oas";

// TODO: Import OpenAPI spec type definitions, see: `openapi.ts`
type Spec = {
  openapi: "3.1";
  info: {
    title: "Example";
    version: "0.0.1";
  };
};

export type OpenApiAppDef = ParseSpec<Spec>;
