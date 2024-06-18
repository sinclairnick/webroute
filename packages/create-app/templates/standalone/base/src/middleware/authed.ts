import { defineMiddleware } from "@webroute/middleware";

export const isAuthed = () => {
  return defineMiddleware((req) => {
    // Somehow check if authed

    return { userId: "123" };
  });
};
