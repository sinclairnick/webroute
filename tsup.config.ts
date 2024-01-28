import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  clean: false,
  dts: true,
  format: ["cjs", "esm"],
  outDir: "dist",
  sourcemap: true,
});
