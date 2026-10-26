import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({ envDir:resolve(import.meta.dirname,'../..'), plugins:[react()], server:{port:5173}, build:{target:'es2022',rollupOptions:{input:{public:resolve(import.meta.dirname,'index.html'),admin:resolve(import.meta.dirname,'admin.html'),learner:resolve(import.meta.dirname,'learn.html')}}} });
