import { appRoutes } from "./routes";
import { openApiRoute } from "./openapi";
import { normaliseRoutes } from "@webroute/route";
import { createRadixRouter } from "@webroute/router";

const allRoutes = {
  ...appRoutes,
  openApiRoute,
};

const routes = normaliseRoutes(allRoutes);

const router = createRadixRouter(routes);

Bun.serve({
  fetch(request, server) {
    const handler = router.match(request);

    if (handler) {
      return handler(request);
    }

    return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  },
});
