import * as React from 'react'
import { Client } from './client'
import { UTXOClient } from '../UTXOClient';


export const Context = React.createContext<Client<UTXOClient> | undefined>(undefined);

export type UtxoGlobalAdapterConfigProps<TProvider extends UTXOClient = UTXOClient> = {
  /** React-decorated Client instance */
  client: Client<TProvider>
}

export function UtxoGlobalAdapterConfig<TProvider extends UTXOClient>({
  children,
  client,
}: React.PropsWithChildren<UtxoGlobalAdapterConfigProps<TProvider>>) {
  return <Context.Provider value={client as unknown as Client}>
    {children}
  </Context.Provider>
}

export function useClient<TProvider extends UTXOClient>() {
  const client = React.useContext(Context) as unknown as Client<TProvider>
  if (!client) throw new Error(['`useClient` must be used within `UtxoGlobalAdapterConfig`.\n'].join('\n'))
  return client
}
