
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  resolve: {
    // Esto permite importar sin extensiones .tsx o .ts de forma segura
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // Aseguramos que trate archivos TSX correctamente
      external: [],
    }
  }
});
