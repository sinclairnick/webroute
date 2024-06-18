import { createRadixRouter } from "@webroute/router";
import { normaliseRoutes } from "@webroute/route";
import { appRoutes } from "./routes/index";

export const routes = normaliseRoutes(appRoutes);
const router = createRadixRouter(routes);

export const app = async (req: Request) => {
  const match = router.match(req);

  try {
    const response = await match?.(req);

    if (response) {
      return response;
    }
  } catch (e) {
    console.error(e);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("Not found", { status: 404 });
};
