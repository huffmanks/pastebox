import devServer from "@hono/vite-dev-server";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  const isDev = process.env.NODE_ENV === "development";

  return {
    plugins: [
      react(),
      tailwindcss(),

      isDev
        ? devServer({
            entry: "./api/index.ts",
          })
        : undefined,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
    },
  };
});
