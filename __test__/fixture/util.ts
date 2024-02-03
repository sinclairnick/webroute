import { route } from "../../dist";

export const EmptyRoute = route().handle((req, res, next) => {
  return "OK";
});
