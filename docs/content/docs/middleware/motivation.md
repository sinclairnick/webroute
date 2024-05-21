---
title: Motivation
---

Middleware is a very powerful tool for building web backends. However, many frameworks encourage patterns we believe make understanding code more difficult. Additionally, functionality becomes tightly-coupled to a given framework.

At first glance, `webroute` takes a strange approach. However, if adhered to, end-devlopers are better off.

---

`@webroute/middleware` takes a different approach to middleware.

Instead of allowing middleware to orchestrate the app (e.g. via `next()` calls) or secretly mutate state (e.g. `req.user = user`), our middleware is _functional_ and _softly_ immutable.

Instead of giving the middleware a reference to our app, we think the middleware should return what it wants to run. This inversion provides a handful of benefits.

Using this model, middleware becomes strongly-typed, highly customisable and decoupled from any framework. It's always clear what middleware does, which data it requires and produces, and what app-related side-effects it cause, like returning early.
