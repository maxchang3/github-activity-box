import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    clean: true,
    dts: false,
    format: 'esm',
    loader: {
        '.graphql': 'text',
    },
})
