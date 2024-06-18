import { defineMiddleware } from "..";

const checkOrigin = (origin: string): boolean => {
  // TODO: Update this line
  return origin === "<your_origin_value>";
};

export const csrf = () => {
  return defineMiddleware((req) => {
    const origin = req.headers.get("origin");

    // Ignore CSRF here
    if (req.method === "GET" || req.method === "HEAD") {
      return;
    }

    // Unable to validate origin
    if (origin == null) {
      return new Response("Forbidden", { status: 403 });
    }

    const contentType = req.headers.get("Content-Type");
    switch (contentType) {
      case "multipart/form-data":
      case "text/plain":
      case "application/x-www-form-urlencoded": {
        if (!checkOrigin(origin)) {
          return new Response("Forbidden", {
            status: 403,
          });
        }
      }
    }
  });
};
