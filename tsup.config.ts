import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/*/index.ts"],
  outDir: "dist",
  target: "node20",
  format: ["cjs"],
  platform: "node",
  bundle: true,
  sourcemap: true,
  dts: false,
  clean: true,
  external: [],
});
