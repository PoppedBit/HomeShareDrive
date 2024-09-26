import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readdirSync } from 'fs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const srcPath = path.resolve('./src');
const srcRootContent = readdirSync(srcPath, { withFileTypes: true }).map((dirent) =>
  dirent.name.replace(/(\.ts){1}(x?)/, '')
);

const absolutePathAliases: { [key: string]: string } = {};
srcRootContent.forEach((directory) => {
  absolutePathAliases[directory] = path.join(srcPath, directory);
});

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:42069',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      ...absolutePathAliases
    }
  }
});
