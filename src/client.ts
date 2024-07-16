
import { UTXOClient } from "../UTXOClient"
import { ClientConfig, Client as CoreClient, createClient as createCoreClient } from "@utxoGlobalCore"

export type CreateClientConfig<TProvider extends UTXOClient> = ClientConfig<TProvider>

export function createClient<TProvider extends UTXOClient>({ ...config }: CreateClientConfig<TProvider>) {
  const client = createCoreClient<TProvider>(config)
  return client
}

export type Client<TProvider extends UTXOClient = UTXOClient> = CoreClient<TProvider>
