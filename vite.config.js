import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import inertia from '@inertiajs/vite';
import react from '@vitejs/plugin-react';

const githubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
    base: githubPages ? '/san/' : '/',
    plugins: githubPages
        ? [react()]
        : [
            laravel({
                input: ['resources/js/app.tsx'],
                refresh: true,
            }),
            inertia({ ssr: false }),
            react(),
        ],
    build: githubPages
        ? {
            outDir: 'dist',
            emptyOutDir: true,
        }
        : undefined,
    server: {
        host: '127.0.0.1',
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
