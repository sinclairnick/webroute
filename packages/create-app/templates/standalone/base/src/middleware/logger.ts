import { defineMiddleware } from "@webroute/middleware";

export const logger = () => {
  return defineMiddleware((req) => {
    const start = Date.now();

    return (res) => {
      console.log(`${req.method} ${res.status} (${Date.now() - start}ms)`);
    };
  });
};
