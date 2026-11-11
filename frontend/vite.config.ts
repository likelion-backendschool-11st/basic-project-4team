import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 5173 sits inside a Windows/Hyper-V reserved port range on this machine -> use 4173.
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
});
