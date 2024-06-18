import { appRoutes } from "./routes";
import { ToClient } from "@webroute/route";
import { createTypedClient, createUrl } from "@webroute/client";

export type AppDef = ToClient.InferApp<typeof appRoutes>;

// --- On the client side: ---
export const client = createTypedClient<AppDef>()({
  fetcher: async (config) => {
    const url = createUrl(config);

    // TODO: Fetch

    return { data: {} };
  },
});

const getHello = client("GET /hello");
