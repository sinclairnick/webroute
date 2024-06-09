import { defineMiddleware } from "..";

export const testMiddleware = defineMiddleware((req) => {
  const testHeader = req.headers.get("x-test-header");

  return (res: Response) => {
    const headers = new Headers();
    headers.set("x-test-header", testHeader ?? "");

    return new Response(res.body, { headers });
  };
});

export const testReq = (header: string) => {
  const headers = new Headers();
  headers.set("x-test-header", header ?? "");

  return new Request("https://test.com", { headers });
};
