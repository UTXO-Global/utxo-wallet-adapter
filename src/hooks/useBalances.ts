import { useQuery } from '@tanstack/react-query'
import { QueryConfig } from '../types'
import { useNetwork } from './useNetwork'
import { BalancePayload, BalanceResult, fetchBalance } from '@utxoGlobalCore'
import { useAccount } from './useAccount'

export type UseBalanceArgs = Partial<BalancePayload> & {
  /** Subscribe to changes */
  watch?: boolean
}

export type UseBalanceConfig<TData> = QueryConfig<BalanceResult[], Error, TData, QueryKey>

export const queryKey = ({ accounts, chain }: Partial<BalancePayload>) =>
  [{ entity: 'balances', accounts, chain }] as const

type QueryKey = ReturnType<typeof queryKey>

export function useBalances<TData = BalanceResult[]>({
  gcTime = 1_000,
  enabled = true,
  staleTime,
  watch
}: UseBalanceArgs & UseBalanceConfig<TData> = {}) {
  const { chain } = useNetwork()
  const { accounts } = useAccount()
  const balanceQuery = useQuery({
    queryKey: queryKey({ accounts, chain }),
    queryFn: async ({ queryKey: [{ accounts: accounts_, chain: chain_ }] }) => {
      const balances = await fetchBalance({ accounts: accounts_, chain: chain_ })
      return balances
    },
    gcTime,
    enabled: Boolean(enabled),
    staleTime,
    refetchInterval: watch ? 5_000 : 0,
  })

  return balanceQuery
}
