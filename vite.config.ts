import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    hmr: {
      overlay: false, // Completely suppress dev overlay to protect internal file paths
    },
    watch: {
      ignored: [
        (path: string) => /[\\/]data[\\/]/.test(path) || path.endsWith(".json") || /[\\/]\.git[\\/]/.test(path) || /[\\/](temp|tmp)[\\/]/.test(path) || path.endsWith(".log"),
        "**/data/**",
        "**/data/*",
        "**/*.json",
        "**/.git/**",
        "**/temp/**",
        "**/tmp/**",
        "**/*.log",
      ],
    },
  },
  plugins: [
    tanstackStart({ server: { entry: "server" } }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
