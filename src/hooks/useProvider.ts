// eslint-disable-next-line import/extensions
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector.js'
import { GetProviderArgs, getProvider, watchProvider } from '@utxoGlobalCore'
import { UTXOClient } from '../../UTXOClient'

export type UseProviderArgs = Partial<GetProviderArgs>

export function useProvider<TProvider extends UTXOClient = UTXOClient>({ networkName }: UseProviderArgs = {}) {
  return useSyncExternalStoreWithSelector(
    (cb) => watchProvider<TProvider>({ networkName }, cb),
    () => getProvider<TProvider>({ networkName }),
    () => getProvider<TProvider>({ networkName }),
    (x) => x,
    (a, b) => a.chain.network === b.chain.network,
  )
}
