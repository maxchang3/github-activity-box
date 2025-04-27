import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        setupFiles: ['./test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'clover', 'json'],
        },
        typecheck: {
            tsconfig: './tsconfig.vitest.json',
        },
    },
})
