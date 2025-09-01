import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // ➜ en prod (Pages) le site vit sous /Goonies/
  base: mode === "production" ? "/Goonies/" : "/",
  // ❗ Choisis l’option A (docs) OU l’option B (dist) plus bas
  build: { outDir: "docs" },
}));
