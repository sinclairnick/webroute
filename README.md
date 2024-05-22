# Webroute


Webroute is a collection of interoperable tools for building web-standard APIs, based on the [WinterCG Minimum Common Web API](https://common-min-api.proposal.wintercg.org/).

---

Leaning heavily into web standards, `webroute` draws hard boundaries between routing, middleware, request handling and orchestration.

Ultimately, `webroute` aims to foster a more interoperable JS backend ecosystem, and provides a few primitives, mental models and implementations as a starting point.

[**View tooling documentation ->**](https://webroute.vercel.app)

---

## Philosophy

Webroute adheres to a philosophy where tools should be interoperable to avoid repeating the same effort time and time again. As such, the various packages provided are isolated and independent. The goal is to create functionality that can be swapped in and out with other tools that adhere to the same, underlying, web standards.

On top of reference implementations and tooling, webroute outlines some patterns, approaches and guidance on how to create e.g. framework-agnostic middleware.

## Background

To understand why webroute was developed, we should first look at what is wrong with the JS ecosystem - or any web backend ecosystem, regardless of language.

```ts
const app = new FrameworkApp();

app.use((bespokeReq, res, next) => {
  bespokeReq.someFunctionality();
  next();
});

app.get("/posts/:id", (req, res) => res.send("..."));
```

This example is what you might see in a typical JS web framework. While familiar, and simple to write, it has several problems. We've largely become numb to these problems, but that doesn't mean they stop being problems.

> [!NOTE]
> The popular use of such web frameworks shows they are still very useful. This section is merely meant to illustrate where room for improvement lies.


### Bespoke Request/Response

Each framework tends to create it's own `Request` and `Response` abstraction. When middleware or other tooling builds on this basis, it immediately becomes coupled to the given framework. Consquently, the reach of it's utility is diminished, and the next framework requires a reimplementation.

For end developers creating backend applications, this additionally means they must learn the ins, outs and various edge cases or idiosyncracies for this particular implementation. This adds mental overhead and often results in unexpected issues. For example, `express` will error if you `res.send` after middleware has already `sent the headers`, which is not remotely obvious.

This leads us to the second issue.

### Visibility and Comprehensibility

Using approaches like the above, where middleware is defined _somewhere_ and handlers _somewhere else_, makes it difficult to answer the question: "what code is actually executed during this request?".

These approaches use the framework, and more specifically it's router, as the source of truth for orchestration. But when our API recieves a request it has a single endpoint, a single destination. Following this logic instead, our route handlers should really be the "true" basis or source of truth for what happens. Additionally, by deferring execution to a router, instead of just using the programming language itself to run the code, the ability for us (and our compiler) to associate related code is greatly diminished, making e.g. type-safety impossible.

### Responsibility

In typical web frameworks, middleware are granted the ability to imperatively orchestrate the app. Given middleware is often non-owned code (third party), this further obscures what's going on under the hood. In actuality, middleware operates in such a way that this affordance is often not worth it.

Instead, webroute _inverts the responsibility_ for orchestration. Middleware is only responsible for _doing work_, and returns values that indicate a _suggestion_ for what should happen next. Instead of `next()`, middleware can return data, a `Response` or a response handler, to indicate whether it has computed some data or state, wants to terminate the request early, or do some post-processing on the outgoing `Response`.

### Mutability

Web frameworks frequently employ mutability as the central mechanism for communication and effecting change. Once again, this makes it more difficult to determine what is happening, or to create robust systems.

Instead, webroute prefers a kind of "functional pipeline" approach, where data flows through various functions which can offer to update that data. It is loosely immutable, meaning it's not _truly_ immutable, but leans into immutability as the primary mechanism, over mutating data.

Every piece of functionality, thus becomes a _producer_, instead of a _mutator_. The end user can then decide what to do with the "produce", if anything. Consequently, our system becomes much more observable and trivially customiseable.

### No Web Standards

Aside from the _bespokeness_ of the `Request` and `Response` objects, described above, most frameworks additionally suffer from not leaning into standards. Web standards are a relatively new and evolving standard which provide an opportunity for more standardised tooling too, if we choose to sieze it.

---

All of these improvements over the traditional approaches enable much more observable and reliable backends. Perhaps even more importantly, any code we (or others) write has a much longer lifetime since it is decoupled from any framework, and built on web-standards.


## Packages

To realise the suggested improvements described above, webroute provides several packages. These are entirely independent, and can be used individually or mixed and matched. They are intentionally framework agnostic, so you can also use them with existing (web-standard) frameworks or runtimes.

---

### Route

![Core version](https://img.shields.io/npm/v/%40webroute%2Fcore?label=%40webroute%2Fcore)
![Core size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fcore)

`@webroute/core` boils down to a single export, `route`, which is a tiny utility that makes it easy to build web standard API endpoints that are:

- Declarative
- Atomic
- Interoperable/standard
- Enterprise-grade
- Composible

This is all achieved with this single import:

```ts
import { route } from "@webroute/core
```

This allows us to e.g. validate HTTP inputs and outputs, declare schema shape to enable automatic Open API definitions, and is radically compatible with web standards and any frameworks that might run on web-standards (e.g. nextjs, Hono, Bun, Deno, and many more).

To understand why this might be a good idea, please [read the docs](https://webroute.vercel.app).

---

### Client

![Client version](https://img.shields.io/npm/v/%40webroute%2Fclient?label=%40webroute%2Fclient)
![Client size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fclient)


`@webroute/client` provides client-side helpers for calling APIs, regardless of what fetching client or backend you are using.

---

### Middleware

![Middleware version](https://img.shields.io/npm/v/%40webroute%2Fclient?label=%40webroute%2Fmiddleware)
![Middleware size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fmiddleware)

`@webroute/middleware` is a tiny helper for _defining_ framework-agnostic middleware.

Middleware implementations will be added to separate packages in the future.

---

## Disclaimer

Naturally, with any project like this, one is obliged to preempt this xkcd.

![xkcd](https://imgs.xkcd.com/comics/standards.png)


## Contribution

Feel free to [open any PRs or issues](https://github.com/sinclairnick/webroute/issues) or [start a discussion](https://github.com/sinclairnick/webroute/issues).

## Author

Webroute was initially developed by [Nick Sinclair](https://github.com/sinclairnick)
