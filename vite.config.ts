import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const isTest = typeof process !== "undefined" && !!process.env.VITEST;

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
    tsconfigPaths(),
    !isTest &&
      tanstackStart({
        server: { entry: "server" },
      }),
    !isTest && nitro(),
    react(),
    tailwindcss(),
  ].filter(Boolean) as any[],
});
