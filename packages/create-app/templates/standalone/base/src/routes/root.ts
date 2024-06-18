import { route } from "@webroute/route";
import { logger } from "../middleware/logger";
import { isAuthed } from "../middleware/authed";

// Put all global middleware on this
export const baseRoute = route().use(logger());

// E.g. create a "public" base route
export const publicRoute = baseRoute;

// E.g. create an authed base route
export const authedRoute = baseRoute.use(isAuthed());
