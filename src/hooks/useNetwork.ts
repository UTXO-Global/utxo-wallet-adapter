
import { getNetwork, watchNetwork, switchNetwork as switchNetworkCore } from '@utxoGlobalCore'
import { useSyncExternalStoreWithTracked } from './useSyncExternalStoreWithTracked'

export function useNetwork() {
  return useSyncExternalStoreWithTracked(watchNetwork, getNetwork)
}

export function useSwitchNetwork() {
  const switchNetwork = (network: string) => {
    return switchNetworkCore(network)
  }

  return {
    switchNetwork
  } as const
}
