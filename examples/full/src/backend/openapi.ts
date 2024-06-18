import { createSpec } from "@webroute/oas";
import { ZodJsonSchemaFormatter } from "@webroute/schema/zod";
import { normaliseRoutes, route } from "@webroute/route";
import { appRoutes } from "./routes";

const routes = normaliseRoutes(appRoutes);
export const spec = createSpec(routes, {
  formatter: ZodJsonSchemaFormatter(),
  onCollision(operation) {
    console.log("Collision detected", operation);
  },
});

export const openApiRoute = route("/openapi.json")
  .method("GET")
  .handle(() => {
    return spec.getSpec();
  });
