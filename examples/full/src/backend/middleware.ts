import { defineMiddleware } from "@webroute/middleware";

const isValid = (token: string) => {
  return Math.random() > 0.5;
};

export const isAuthed = () =>
  defineMiddleware((request) => {
    const bearer = request.headers.get("Bearer");
    const token = bearer?.replace("Bearer ", "");

    if (token == null || !isValid(token)) {
      return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
    }

    return { token };
  });
