import Bun from "bun";
import { app } from "./app";

Bun.serve({
  fetch: app,
});
