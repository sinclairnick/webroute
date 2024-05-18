# Webroute

> Towards a web standard backend ecoysystem

Webroute is a project building framework-agnostic tooling for web standard APIs.

[**View documentation ->**](webroute.vercel.app)

---

## `route`

Webroute boils down to a single export, `route`, which is a tiny utility that makes building declarative, validated, schema-introspectable Web API endpoints easy.

```ts
import { route } from "@webroute/core
```

This single function allows us to validate HTTP inputs and outputs, declare schema shape to enable automatic Open API definitions, and is radically compatible with web standards and any frameworks that might run on web-standards (e.g. nextjs, Hono, Bun, Deno, and many more).

To understand why this might be a good idea, please [read the docs](webroute.vercel.app).

## Contribution

Feel free to open any PRs or issues.

## Author

Webroute was initially developed by [Nick Sinclair](https://github.com/sinclairnick)
