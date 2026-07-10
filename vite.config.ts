import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    laravel({
      input: ["views/css/app.css", "views/js/main.jsx"],
      refresh: true,
      ssr: "views/js/ssr.jsx",
    }),
    tailwindcss(),
    react(),
  ],
});
