import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        setupFiles: ['./test/setup.ts'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('src/', import.meta.url)),
            '~': fileURLToPath(new URL('test/', import.meta.url)),
        },
    },
})
