import shallow from 'zustand/shallow'
import { getClient } from '../client'
import { Chain } from '../../../UTXOClient'

export type GetNetworkResult = {
  chain?: Chain & {
    unsupported?: boolean
  }
  chains: Chain[]
}

export function getNetwork(): GetNetworkResult {
  const client = getClient()
  const networkName = client.data?.network
  const activeChains = client.chains ?? []
  const activeChain = activeChains.find((x) => x.network.toLowerCase() === networkName?.toLowerCase())

  return {
    chain: networkName
      ? {
        ...activeChain,
        unsupported: client.connector?.isChainUnsupported(networkName),
      }
      : undefined,
    chains: activeChains,
  } as const
}

export async function switchNetwork(network: string): Promise<GetNetworkResult> {
  const client = getClient()
  await client.connector?.switchNetwork(network)
  return getNetwork()
}

export type WatchNetworkCallback = (data: GetNetworkResult) => void

export type WatchNetworkConfig = {
  selector?({ networkName, chains }: { networkName?: string; chains?: Chain[] }): any
}

export function watchNetwork(callback: WatchNetworkCallback, { selector = (x) => x }: WatchNetworkConfig = {}) {
  const client = getClient()
  const handleChange = () => callback(getNetwork())
  const unsubscribe = client.subscribe(
    ({ data, chains }) => selector({ networkName: data?.network, chains }),
    handleChange,
    {
      equalityFn: shallow,
    },
  )
  return unsubscribe
}
