// vite.config.ts
import { defineConfig } from "file:///D:/Project/WORK/Crypto%20Snake%20Arena/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Project/WORK/Crypto%20Snake%20Arena/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/Project/WORK/Crypto%20Snake%20Arena/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "D:\\Project\\WORK\\Crypto Snake Arena\\frontend";
function legacyScript() {
  const version = Date.now();
  return {
    name: "legacy-script",
    transformIndexHtml(html) {
      return html.replace(/<script type="module" crossorigin src="([^"]+)"[^>]*><\/script>/g, `<script defer src="$1?v=${version}"></script>`).replace(/<script type="module" src="([^"]+)"[^>]*><\/script>/g, `<script defer src="$1?v=${version}"></script>`);
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss(), legacyScript()],
  resolve: {
    alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") }
  },
  server: { port: 5173 },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0XFxcXFdPUktcXFxcQ3J5cHRvIFNuYWtlIEFyZW5hXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQcm9qZWN0XFxcXFdPUktcXFxcQ3J5cHRvIFNuYWtlIEFyZW5hXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Qcm9qZWN0L1dPUksvQ3J5cHRvJTIwU25ha2UlMjBBcmVuYS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5cclxuZnVuY3Rpb24gbGVnYWN5U2NyaXB0KCkge1xyXG4gIGNvbnN0IHZlcnNpb24gPSBEYXRlLm5vdygpXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdsZWdhY3ktc2NyaXB0JyxcclxuICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XHJcbiAgICAgIHJldHVybiBodG1sXHJcbiAgICAgICAgLnJlcGxhY2UoLzxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiIGNyb3Nzb3JpZ2luIHNyYz1cIihbXlwiXSspXCJbXj5dKj48XFwvc2NyaXB0Pi9nLCBgPHNjcmlwdCBkZWZlciBzcmM9XCIkMT92PSR7dmVyc2lvbn1cIj48L3NjcmlwdD5gKVxyXG4gICAgICAgIC5yZXBsYWNlKC88c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBzcmM9XCIoW15cIl0rKVwiW14+XSo+PFxcL3NjcmlwdD4vZywgYDxzY3JpcHQgZGVmZXIgc3JjPVwiJDE/dj0ke3ZlcnNpb259XCI+PC9zY3JpcHQ+YClcclxuICAgIH0sXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpLCBsZWdhY3lTY3JpcHQoKV0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHsgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSB9LFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7IHBvcnQ6IDUxNzMgfSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgZm9ybWF0OiAnaWlmZScsXHJcbiAgICAgICAgaW5saW5lRHluYW1pY0ltcG9ydHM6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVUsU0FBUyxvQkFBb0I7QUFDOVYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUt6QyxTQUFTLGVBQWU7QUFDdEIsUUFBTSxVQUFVLEtBQUssSUFBSTtBQUN6QixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixtQkFBbUIsTUFBTTtBQUN2QixhQUFPLEtBQ0osUUFBUSxvRUFBb0UsMkJBQTJCLE9BQU8sYUFBYSxFQUMzSCxRQUFRLHdEQUF3RCwyQkFBMkIsT0FBTyxhQUFhO0FBQUEsSUFDcEg7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksR0FBRyxhQUFhLENBQUM7QUFBQSxFQUNoRCxTQUFTO0FBQUEsSUFDUCxPQUFPLEVBQUUsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTyxFQUFFO0FBQUEsRUFDakQ7QUFBQSxFQUNBLFFBQVEsRUFBRSxNQUFNLEtBQUs7QUFBQSxFQUNyQixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixzQkFBc0I7QUFBQSxNQUN4QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
