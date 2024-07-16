/* eslint-disable consistent-return */
import { GetAccountResult, getAccounts, watchAccount } from '@utxoGlobalCore'
import * as React from 'react'
import { useSyncExternalStoreWithTracked } from './useSyncExternalStoreWithTracked'

export type UseAccountConfig = {
  /** Function to invoke when connected */
  onConnect?({
    account,
    connector,
    isReconnected,
  }: {
    account?: GetAccountResult['accounts']
    connector?: GetAccountResult['connector']
    isReconnected: boolean
  }): void
  /** Function to invoke when disconnected */
  onDisconnect?(): void
}

export function useAccount({ onConnect, onDisconnect }: UseAccountConfig = {}) {
  const account = useSyncExternalStoreWithTracked(watchAccount, getAccounts)
  const previousAccount = React.useRef<typeof account>()

  if (!!onConnect && previousAccount.current?.status !== 'connected' && account.status === 'connected')
    onConnect({
      account: account.accounts,
      connector: account.connector,
      isReconnected: previousAccount.current?.status === 'reconnecting',
    })

  if (!!onDisconnect && previousAccount.current?.status === 'connected' && account.status === 'disconnected')
    onDisconnect()

  previousAccount.current = account

  return account
}
