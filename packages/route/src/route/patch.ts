// This file contains temporary patches which will eventually be deleted when they can be.

import { isBun } from "../util";

function fixedRequestClone(this: Request) {
  const [a, b] = this.body?.tee() ?? [null, null];

  Object.defineProperty(this, "body", {
    get() {
      return a;
    },
  });

  return new Request(this, {
    body: b,
    // @ts-expect-error
    duplex: "half", // Needed for node
  });
}

/**
 * Temporarily fixes request.clone method until
 * e.g. (https://github.com/oven-sh/bun/issues/6348)
 * is fixed
 */
export const fixRequestClone = (req: Request): Request => {
  if (!isBun) return req;
  req.clone = fixedRequestClone.bind(req);

  return req;
};

function fixedResponseClone(this: Response) {
  const [a, b] = this.body?.tee() ?? [null, null];

  Object.defineProperty(this, "body", {
    get() {
      return a;
    },
  });

  return new Response(b, this);
}

/**
 * Temporarily fixes request.clone method until
 * e.g. (https://github.com/oven-sh/bun/issues/6348)
 * is fixed
 */
export const fixResponseClone = (res: Response): Response => {
  if (!isBun) return res;
  res.clone = fixedResponseClone.bind(res);

  return res;
};
