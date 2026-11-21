import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Builds the popup into extension/dist. The popup reuses the website's generator and vault
// components and the framework-free modules in ../lib, so there is one implementation.
export default defineConfig({
  root: here,
  base: "./", // extension pages must use relative asset paths
  // The shared components are .js files that contain JSX, so parse those directories as JSX.
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: {
    loader: "jsx",
    include: /\/(components|extension\/src)\/.*\.jsx?$/,
    exclude: /node_modules/,
  },
  server: { fs: { allow: [path.join(here, "..")] } },
  build: {
    outDir: path.join(here, "dist"),
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: { input: path.join(here, "popup.html") },
  },
});
