import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

const host = process.env["TAURI_DEV_HOST"];

// https://vite.dev/config/ and https://tauri.app/start/frontend/vite/
export default defineConfig({
  plugins: [react()],

  // Keep Rust errors visible in `tauri dev`.
  clearScreen: false,

  // Tauri expects a fixed port; fail if it is taken.
  server: {
    port: 1420,
    strictPort: true,
    host: host ?? false,
    ...(host ? { hmr: { protocol: "ws", host, port: 1421 } } : {}),
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  build: {
    // Tauri 2 webviews: WebView2 (Chromium), WKWebView (Safari 16+), WebKitGTK.
    target: ["es2022", "chrome111", "safari16"],
  },
});
