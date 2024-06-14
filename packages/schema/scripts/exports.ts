import pkg from "../package.json";
import { write } from "bun";

const Exports = [
  "zod",
  "yup",
  "joi",
  "superstruct",
  "valibot",
  "runtypes",
  "typebox",
];

const main = async () => {
  const _pkg = { ...pkg };

  for (const name of Exports) {
    _pkg.exports[`./${name}`] = {
      require: `./${name}.js`,
      import: `./dist/${name}.mjs`,
      types: `./${name}.d.ts`,
    };

    _pkg.files.push(`name.js`);
    _pkg.files.push(`name.d.ts`);
  }

  await write("./package.json", JSON.stringify(_pkg, null, 2));
};

main();
