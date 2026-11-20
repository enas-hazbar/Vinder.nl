import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
export default defineConfig({
  plugins: [
  react(),
  {
    name: 'vinder-404',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          req.method !== 'GET' ||
          !req.headers.accept?.includes('text/html')
        ) return next();

        const pathname = new URL(
          req.url || '/',
          'http://localhost'
        ).pathname;

        if (
          pathname === '/' ||
          pathname.startsWith('/@') ||
          pathname.startsWith('/api/') ||
          pathname.includes('..')
        ) return next();

        const file = pathname.slice(1);

        if (
          existsSync(resolve(file)) ||
          existsSync(resolve('public', file))
        ) return next();

        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(
          readFileSync(resolve('public/404.html'), 'utf8')
        );
      });
    }
  }
],
  server: {host:'127.0.0.1', proxy:{'/api':'http://127.0.0.1:3001'}},
  build: {rollupOptions: {input:{home:resolve(import.meta.dirname,'index.html'),login:resolve(import.meta.dirname,'login.html'),create:resolve(import.meta.dirname,'create.html'),dashboard:resolve(import.meta.dirname,'dashboard.html'), contact: resolve(import.meta.dirname, 'contact.html'),status: resolve(import.meta.dirname, 'status.html')}}}
});
