import { publicRoute } from "./root";
import { OAS } from "@webroute/oas";

export const helloRoute = OAS.Operation(
  publicRoute
    .path("/")
    .method("get")
    .handle((req) => {
      return { hello: "world" };
    }),
  {
    operationId: "greeting",
    description: "A friendly greeting",
  }
);
