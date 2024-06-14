#!/usr/bin/env node

// Injects common data into the various package.json files
import fs from "node:fs";

const packages = ["client", "middleware", "route", "oas", "router", "schema"];

const main = async () => {
  const promises = packages.map(async (name) => {
    const prefix = `./packages/${name}`;
    const pkgPath = `${prefix}/package.json`;

    // PACKAGE.JSON
    const raw = await fs.promises.readFile(pkgPath, "utf-8");
    /** @type {import("pkg-types").PackageJson} */
    const json = JSON.parse(raw);

    json.author = {
      name: "Nick Sinclair",
      email: "nicksinclair@xtra.co.nz",
      url: "https://github.com/sinclairnick",
    };

    json.bugs = {
      url: "https://github.com/sinclairnick/webroute/issues",
    };

    json.license = "MIT";

    json.homepage = "https://webroute.vercel.app";

    json.repository = "https://github.com/sinclairnick/webroute";

    const output = JSON.stringify(json, null, 2);

    await fs.promises.writeFile(pkgPath, output);

    // LICENSE
    const license = await fs.promises.readFile("./LICENSE", "utf-8");
    await fs.promises.writeFile(`${prefix}/LICENSE`, license);

    // README
    const readme = [
      `# @webroute/${name}`,
      "",
      "This package is part of the `webroute` project.",
      "",
      `[View package documentation](https://webroute.vercel.app/docs/${name})`,
      "",
      `[View documentation](https://webroute.vercel.app/docs/${name})`,
      "",
      "[View project README](https://github.com/sinclairnick/webroute/README.md)",
      "",
      "## License",
      "",
      "All source code is [MIT licensed](./LICENSE)",
    ].join("\n");

    await fs.promises.writeFile(`${prefix}/README.md`, readme);
  });

  await Promise.all(promises);
};

main();
