import { createSpec } from "@webroute/oas";
import { routes } from "./app";

// TODO: Import the appropriate schema->jsonschema formatter
// import { ZodToJsonFormatter } from "@webroute/schema/zod"

export const spec = createSpec(routes, {
  // TODO: Place it here
  // formatter: ZodToJsonFormatter
});

const printSpec = () => {
  const specDts = `declare const data: ${spec.getSpecAsJson()};\nexport default data;`;
  console.log(
    "Place this in `spec.d.ts` to enable client-side inference from your OpenAPI spec."
  );
  console.log(specDts);
};

// Uncomment to play around with client-side inference
printSpec();
