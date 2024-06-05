import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    zod: "src/validators/zod.ts",
    yup: "src/validators/yup.ts",
    valibot: "src/validators/valibot.ts",
    typebox: "src/validators/typebox.ts",
    superstruct: "src/validators/superstruct.ts",
    runtypes: "src/validators/runtypes.ts",
    joi: "src/validators/joi.ts",
  },
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  outDir: "dist",
  sourcemap: false,
  external: [
    "zod",
    "yup",
    "valibot",
    "superstruct",
    "runtypes",
    "typebox",
    "joi",
  ],
});
