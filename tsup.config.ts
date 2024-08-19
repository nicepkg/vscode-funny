import { defineConfig } from 'tsup'

export default defineConfig(async () => [
  {
    name: 'node',
    entry: ['src/index.ts'],
    format: ['cjs'],
    shims: false,
    dts: false,
    outDir: 'dist',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    clean: true,
    define: {
      'process.env.IS_BROWSER': 'false'
    },
    treeshake: {
      preset: 'smallest',
      moduleSideEffects: 'no-external'
    },
    external: ['vscode']
  }
])
