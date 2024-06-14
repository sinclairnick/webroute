import { createSpec } from "@webroute/oas";
import { createParser, createFormatter } from "@webroute/schema";
import { ZodParser } from "@webroute/schema/zod";
import { TypeBoxFormatter } from "@webroute/schema/typebox";
import { normaliseRoutes, route } from "@webroute/route";
import { appRoutes } from "./routes";

const zodParser = createParser(ZodParser());
const typeBoxFormatter = createFormatter(TypeBoxFormatter());

const routes = normaliseRoutes(appRoutes);
export const spec = createSpec(routes, {
  formatter: (zodSchema) => {
    const schemaDef = zodParser.parse(zodSchema);

    const jsonSchema = typeBoxFormatter.format(schemaDef);

    return jsonSchema as any;
  },
  onCollision(operation) {
    console.log("Collision detected", operation);
  },
});

export const openApiRoute = route("/openapi.json")
  .method("GET")
  .handle(() => {
    return spec.getSpec();
  });
