<div align="center">
	
<h1>Webroute</h1>

<p>
	<b>Web APIs, from the route-up.</b>
</p>

</div>

<img src="./static/webroute-cover.jpg"/>

<div align="center">
<a href="https://webroute.vercel.app/docs">
Docs
</a>
&bull;
<a href="https://webroute.vercel.app/docs/building-apps/quick-start">
Quick Start
</a>
&bull;
<a href="https://webroute.vercel.app/docs/building-apps/routes">
Route
</a>
&bull;
<a href="https://webroute.vercel.app/docs/building-apps/client">
Client
</a>
&bull;
<a href="https://webroute.vercel.app/docs/building-apps/openapi">
OpenAPI
</a>
</div>

## Overview

Webroute helps you build self-sufficient, web-standard routes that have everything they need: path, method, I/O shape and validation, middleware and request handler.

It was invented to make building sophisticated APIs easier in the diverse ecosystem of serverless (but also serverful) full-stack and backend development.

### Inspiration

Webroute was heavily inspired by tRPC, but built specifically for HTTP. So if you're a fan of either, you'll probably like webroute.

## Features

- 👋 Unopinionated and minimal API, by design
- 🔒 End-to-end type safety (including middleware)
- ✅ First-class validation and schema support
- 🕸️ HTTP based
- 🚏 Works well with serverless routes
- 🐳 ...or monolithic backends

## Example Usage

A basic webroute might look something like this:

```ts
import { route } from "@webroute/route";

const myRoute = route("/user/:id")
  .use(authMiddleware)
  .params(z.object({ id: z.string() }))
  .handle(async (req) => {
    // ...do work
  });
```

Which is just a regular web-standard request handler:

```ts
const response = myRoute(new Request("..."));
```

Being web-standard and self-sufficient, it can be used directly, with no modification, with popular frameworks like `Next.js`, and `Hono` or within runtimes like `bun`, `deno` and node.

Read the [Quick Start](https://webroute.vercel.app/docs/building-apps/quick-start).

## What's in the box?

Webroute provides the functionality of a full-blown framework, without being one. Instead, it offers a handful of packages which can be selectively installed to fill in the gaps, when your use case requires it.

Webroute is "full-stack", in the sense it provides utilities and patterns for both the client-side and server-side. However, these client- and server-side tools are not dependent on the other - one can be used without the other.

## Compatibility

Webroute works with all runtimes or frameworks that conform to the WinterCG Minimum Web Standard.

### Frameworks

- [x] `Hono`
- [x] `Next.js`
- [x] `Remix`
- [x] `SolidStart`
- [x] `SvelteKit`

### Runtimes

- [x] `Bun`
- [x] `Deno`
- [x] `Node` <small>(via adapter)</small>
- [x] `Cloudflare Workes`
- [x] `Vercel Edge`
