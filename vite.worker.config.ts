import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    ssr: true,
    outDir: "./build/worker",
    rollupOptions: {
      input: "./app/worker.ts",
      output: {
        format: "esm",
        entryFileNames: "index.js",
      },
    },
  },
  plugins: [tsconfigPaths()],
  resolve: {
    conditions: ["node"],
  },
});
