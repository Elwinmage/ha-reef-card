import { defineConfig } from "vite";
import { resolve } from "path";

// Bundle of the demo pages: the card itself (src/) and a fake Home
// Assistant driving it. Built apart from the card, into demo/dist.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 50000,
    lib: {
      entry: resolve(__dirname, "rsled_demo.ts"),
      formats: ["es"],
      fileName: () => "rsled_demo.js",
    },
  },
});
