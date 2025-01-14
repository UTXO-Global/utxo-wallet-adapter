/* eslint-disable consistent-return */
/* eslint-disable default-case */
import shallow from 'zustand/shallow'
import { Connector, ConnectorData } from '../connectors/base'
import { getClient, Client } from '../client'

type Data = ConnectorData

export type GetAccountResult =
  | {
      accounts: NonNullable<Data['accounts']>
      connector: NonNullable<Client['connector']>
      isConnected: true
      isConnecting: false
      isDisconnected: false
      isReconnecting: false
      status: 'connected'
    }
  | {
      accounts: Data['accounts']
      connector: Client['connector']
      isConnected: boolean
      isConnecting: false
      isDisconnected: false
      isReconnecting: true
      status: 'reconnecting'
    }
  | {
      accounts: undefined
      connector: undefined
      isConnected: false
      isReconnecting: false
      isConnecting: true
      isDisconnected: false
      status: 'connecting'
    }
  | {
      accounts: undefined
      connector: undefined
      isConnected: false
      isReconnecting: false
      isConnecting: false
      isDisconnected: true
      status: 'disconnected'
    }

export function getAccounts(): GetAccountResult {
  const { data, connector, status } = getClient()
  switch (status) {
    case 'connected':
      return {
        accounts: data?.accounts as NonNullable<Data['accounts']>,
        connector: connector as NonNullable<Client['connector']>,
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
        isReconnecting: false,
        status,
      } as const
    case 'reconnecting':
      return {
        accounts: data?.accounts,
        connector,
        isConnected: !!data?.accounts,
        isConnecting: false,
        isDisconnected: false,
        isReconnecting: true,
        status,
      } as const
    case 'connecting':
      return {
        accounts: undefined,
        connector: undefined,
        isConnected: false,
        isConnecting: true,
        isDisconnected: false,
        isReconnecting: false,
        status,
      } as const
    case 'disconnected':
      return {
        accounts: undefined,
        connector: undefined,
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
        isReconnecting: false,
        status,
      } as const
  }
}

export type WatchAccountCallback = (data: GetAccountResult) => void

export type WatchAccountConfig = {
  selector?({
    accounts,
    connector,
    status,
  }: {
    accounts?: Data['accounts']
    connector?: Connector
    status: GetAccountResult['status']
  }): any
}

export function watchAccount(callback: WatchAccountCallback, { selector = (x) => x }: WatchAccountConfig = {}) {
  const client = getClient()
  const handleChange = () => callback(getAccounts())
  const unsubscribe = client.subscribe(
    ({ data, connector, status }) =>
      selector({
        accounts: data?.accounts,
        connector,
        status,
      }),
    handleChange,
    {
      equalityFn: shallow,
    },
  )
  return unsubscribe
}
