import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        setupFiles: ['./test/setup.ts'],
        typecheck: {
            tsconfig: './tsconfig.vitest.json',
        },
    },
})
