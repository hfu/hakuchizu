import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // GitHub Pages 用に相対パス
  build: {
    outDir: 'docs', // 静的コンテンツを docs ディレクトリに出力
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html',
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  },
  server: {
    open: true
  }
});
