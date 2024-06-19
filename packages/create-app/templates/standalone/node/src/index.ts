import { serve } from "@hono/node-server";
import { app } from "./app";

serve({ fetch: app }, (info) => {
  // ...
});
