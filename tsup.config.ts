import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    core: 'core/src/index.ts',
    index: 'src/index.ts',
    'connectors/unisat': 'core/src/connectors/unisat.ts',
    'connectors/xverse': 'core/src/connectors/xverse.ts',
    'connectors/utxo-global': 'core/src/connectors/utxo-global.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  treeshake: true,
  splitting: true,
})
