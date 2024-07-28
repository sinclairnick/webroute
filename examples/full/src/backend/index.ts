import { appRoutes } from "./routes";
import { openApiRoute } from "./openapi";
import { createRadixRouter } from "@webroute/router";
import { Route } from "@webroute/route";

const allRoutes = {
  ...appRoutes,
  openApiRoute,
};

const routes = Object.values(allRoutes).map(Route.normalise);

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
