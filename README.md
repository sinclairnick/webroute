<div align="center">

<h1>Webroute</h1>

<p><b>Building blocks for REST APIs, built on industry standards</b></p>

</div>

<img src="./static/webroute-cover.jpg"/>

## Overview

Webroute is a set of building blocks which can combine to form a fully fledged web framework. Each tool is decoupled from the next, meaning they are all independently useful. But they can also be stacked, leaving you with a strong foundation for quickly building backend web apps that are future-proofed.

**View the [documentation](https://webroute.vercel.app).**

## Example Usage

```ts
import { route } from "@webroute/route";

export const myRoute = route("/post/:id")
  .method("get")
  .use(isAuthed())
  .params(z.object({ id: z.string() }))
  .handle(async (req, c) => {
    const { params } = await c.parse();
    // ...
    return { title: "..." };
  });

// myRoute: (req: Request) => Response
```

## How is this different to X?

Webroute is not a framework. Modern web apps are deployed to a range of different environments, runtimes and architectures. Webroute provides a handful of _independent_ libraries to help with common tasks like routing, route handling, middleware and client-side type-safety.

Webroute was designed to get out of your way and to be minimally opinionated. We prefer requiring slightly more additional setup if it means much greater flexibility – and less lock-in – for the lifetime of an app.

## [Packages](https://webroute.vercel.app/docs/packages)

Webroute provides several packages that are entirely independent of one another. Combined, they can be used to create fully-fledged REST APIs.

They will work with any framework or runtime that utilises web-standard `Request` and `Response` objects.

| Package                                                                 | Purpose                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| [**Route**](https://webroute.vercel.app/docs/route/overview)            | Build powereful and atomic web-standard request handlers      |
| [**Client**](https://webroute.vercel.app/docs/client/overview)          | Create type-safe clients for any REST API                     |
| [**Middleware**](https://webroute.vercel.app/docs/middleware/overview)  | Middleware compatible with any framework                      |
| [**Schema**](https://webroute.vercel.app/docs/schema/overview)          | Universal converters, parsers and infererence for any schema  |
| [**Router**](https://webroute.vercel.app/docs/router/overview)          | Match incoming `Request`s to request handlers                 |
| [**OpenAPI Spec (OAS)**](https://webroute.vercel.app/docs/oas/overview) | Define, generate and infer OpenAPI schema without any codegen |

## Compatibility

Webroute was built from the ground up to be friendly with most existing tools. It can be used standalone or alongside existing frameworks, and in various runtimes.

### Frameworks:

- ✅ Hono
- ✅ NextJS
- ✅ Remix
- ✅ SolidStart

### Runtimes:

- ✅ Bun
- ✅ Deno
- ✅ Node (via adapter)
- ✅ Cloudflare Workers
- ✅ Vercel Edge

---

## Contribution

Feel free to [open any PRs or issues](https://github.com/sinclairnick/webroute/issues) or [start a discussion](https://github.com/sinclairnick/webroute/issues).

## Author

Webroute was initially developed by [Nick Sinclair](https://github.com/sinclairnick)
