---
title: Overview
---

```ts
import { defineMiddleware, MiddlewareFn } from "@webroute/middleware
```

The package is _not_ where you'll find a list of usable middleware. Instead, it acts as the foundation for building framework-agnostic middleware.

The `webroute` approach to middleware differs to traditional middleware because it intentionally avoids framework-specific code. As a consequence, the traditional callback-based approach to middleware is _inverted_: middleware should provide _us_ with callbacks instead of the other way around.

This carries many benefits as detailed in [Motivation](./middleware/motivation).

---

## MiddlewareFn

`webroute` middleware is essentially anything that conforms to the following type signature. It should not rely on any framework-specific code too.

```ts
// (Both fns here can also be async)
type = (request: Request, ...rest: any[])
	=> 	| Response
			| DataResult
			| ((response: Response, ...rest: any[]) => Response)

```

In a nutshell, middleware can return data, a response or a response handler. Any functions here can be async, naturally. Middleware functions can also take any number of additional arguments.

While in theory these arguments _could_ support e.g. a `next()` function, this would violate the point of this approach entirely.

The `MiddlewareFn` type merely enforces the above.

## Define Middleware

We can define a middleware using the `defineMiddleware` function. Ultimately, this ensures our middleware is adhering to the `MiddlewareFn` signature, while still etaining all the type information.

```ts

const defineMiddleware(() => {/**...*/})

```
