import { publicRoute } from "./root";

export const helloRoute = publicRoute
  .path("/hello")
  .method("get")
  .handle((req) => {
    return { hello: "world" };
  });
