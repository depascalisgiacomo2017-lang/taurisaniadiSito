import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        spectator: './spectator.html',
        admin: './admin_panel.html',
        caporione: './caporione.html'
      }
    }
  }
});
