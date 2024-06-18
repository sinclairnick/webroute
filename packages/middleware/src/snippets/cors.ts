import { defineMiddleware } from "..";

// TODO: Uncomment any lines you find valid
export const cors = () => {
  return defineMiddleware((req) => {
    // Maybe you want to use this
    const origin = req.headers.get("origin");

    return (res) => {
      const headers = new Headers(res.headers);

      headers.set("Access-Control-Allow-Origin", "*");

      // headers.set("Vary", "Origin"); // Uncommend if origin != "*"

      // headers.set("Access-Control-Allow-Credentials", "true");

      // headers.set(
      //   "Access-Control-Expose-Headers",
      //   [
      //     /** Exposed headers */
      //   ].join(",")
      // );

      if (req.method !== "OPTION") {
        return new Response(res.body, { ...res, headers });
      }

      // set("Access-Control-Max-Age", String(1000 * 60));

      // headers.set(
      //   "Access-Control-Allow-Methods",
      //   [
      //     /** Allowed methods */
      //   ].join(",")
      // );

      // headers.set(
      //   "Access-Control-allow-Headers",
      //   //** Or set your own headers explicitly */
      //   req.headers
      //     .get("Access-Control-Request-Headers")
      //     ?.split(/\s*,\s*/)
      //     .join(",") ?? ""
      // );

      headers.delete("Content-Length");
      headers.delete("Content-Type");

      return new Response(null, {
        ...res,
        headers,
        status: 403,
      });
    };
  });
};
