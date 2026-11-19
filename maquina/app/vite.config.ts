import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const api = "http://127.0.0.1:4747";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  server: { port: 5199, proxy: { "/api": api, "/arquivo": api, "/bruto": api } },
});
