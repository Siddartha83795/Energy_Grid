import { defineConfig } from "nitro/config";

export default defineConfig({
  externals: {
    external: ["mongodb"],
  },
  rollupConfig: {
    external: ["mongodb"],
  },
});
