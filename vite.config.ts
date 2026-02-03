import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HaReefCard',
      fileName: () => 'ha-reef-card.js'
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'ha-reef-card.js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});
