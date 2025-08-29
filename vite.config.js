import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Goonies/", // ⚠️ remplace par le nom exact de ton repo GitHub
  build: { outDir: "docs" }, // pour publier via /docs
});
