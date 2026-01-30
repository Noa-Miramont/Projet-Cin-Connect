// vite.config.js
import { defineConfig } from "file:///Users/nm.mp4/Desktop/hetic/projet/2e%CC%80me%20anne%CC%81e/Cine%CC%81Connect/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.7/node_modules/vite/dist/node/index.js";
import react from "file:///Users/nm.mp4/Desktop/hetic/projet/2e%CC%80me%20anne%CC%81e/Cine%CC%81Connect/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@22.19.7_/node_modules/@vitejs/plugin-react/dist/index.js";
import { TanStackRouterVite } from "file:///Users/nm.mp4/Desktop/hetic/projet/2e%CC%80me%20anne%CC%81e/Cine%CC%81Connect/node_modules/.pnpm/@tanstack+router-plugin@1.157.16_@tanstack+react-router@1.157.16_react-dom@18.3.1_react@18.3._54goi3gxez3swjji5ama2znfsi/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import path from "path";
var __vite_injected_original_dirname = "/Users/nm.mp4/Desktop/hetic/projet/2e\u0300me anne\u0301e/Cine\u0301Connect/frontend";
var vite_config_default = defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/router",
      generatedRouteTree: "./src/router/routeTree.gen.ts"
    }),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbm0ubXA0L0Rlc2t0b3AvaGV0aWMvcHJvamV0LzJlXHUwMzAwbWUgYW5uZVx1MDMwMWUvQ2luZVx1MDMwMUNvbm5lY3QvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9ubS5tcDQvRGVza3RvcC9oZXRpYy9wcm9qZXQvMmVcdTAzMDBtZSBhbm5lXHUwMzAxZS9DaW5lXHUwMzAxQ29ubmVjdC9mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbm0ubXA0L0Rlc2t0b3AvaGV0aWMvcHJvamV0LzJlJUNDJTgwbWUlMjBhbm5lJUNDJTgxZS9DaW5lJUNDJTgxQ29ubmVjdC9mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IFRhblN0YWNrUm91dGVyVml0ZSB9IGZyb20gJ0B0YW5zdGFjay9yb3V0ZXItcGx1Z2luL3ZpdGUnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtcbiAgICAgICAgVGFuU3RhY2tSb3V0ZXJWaXRlKHtcbiAgICAgICAgICAgIHJvdXRlc0RpcmVjdG9yeTogJy4vc3JjL3JvdXRlcicsXG4gICAgICAgICAgICBnZW5lcmF0ZWRSb3V0ZVRyZWU6ICcuL3NyYy9yb3V0ZXIvcm91dGVUcmVlLmdlbi50cydcbiAgICAgICAgfSksXG4gICAgICAgIHJlYWN0KClcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJylcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICAgIHBvcnQ6IDUxNzMsXG4gICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICcvc29ja2V0LmlvJzoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrWixTQUFTLG9CQUFvQjtBQUMvYSxPQUFPLFdBQVc7QUFDbEIsU0FBUywwQkFBMEI7QUFDbkMsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLG1CQUFtQjtBQUFBLE1BQ2YsaUJBQWlCO0FBQUEsTUFDakIsb0JBQW9CO0FBQUEsSUFDeEIsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsY0FBYztBQUFBLFFBQ1YsUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBLE1BQ1I7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
