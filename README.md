<div align="center">
	
<h1>Webroute</h1>

<p>
	<b>Rethinking APIs, from the route-up.</b>
</p>

</div>

<img src="./static/webroute-cover.jpg"/>

<div align="center">
<a href="https://webroute.vercel.app/docs">
Docs
</a>
&bull;
<a href="https://webroute.vercel.app/docs/guides/quick-start">
Quick Start
</a>
&bull;
<a href="https://webroute.vercel.app/docs/route/overview">
Route
</a>
&bull;
<a href="https://webroute.vercel.app/docs/client/overview">
Client
</a>
&bull;
<a href="https://webroute.vercel.app/docs/oas/overview">
OpenAPI
</a>
</div>

## Overview

Webroute takes a "route-first" approach to API development. This means your routes are the source of truth and can be run standlone, or as part of a wider app.

By shifting all work to the route, and leaning into industry standards, your apps become compatible with virtually all runtimes and frameworks with minimal adjustment necessary.

## Why?

Modern API development is extremely fragmented across vast combinations of frameworks, runtimes and platforms. Monolithic web frameworks are no longer suitable.

Instead, webroute has implemented the core elements you _might_ need in a web framework, and you can easily piece together those that suit your use case.

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
