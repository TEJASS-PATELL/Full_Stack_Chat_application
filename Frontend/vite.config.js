import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    rollupOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({        // ✅ Polyfill for `global`
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",             // ✅ Add global reference
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  
});
