import { ConnectorNotFoundError, WalletProviderError, UserRejectedRequestError } from '../errors'
import { getClient } from '../client'
import { SendNativeCoinPayload, SendNativeCoinResponse } from '../connectors'

export type SendNativeCoinArgs ={
    payload: SendNativeCoinPayload,
}

export async function sendNativeCoin(args: SendNativeCoinPayload): Promise<SendNativeCoinResponse> {
  try {
    const client = getClient()
    if (!client.connector) throw new ConnectorNotFoundError()
    return client.connector.sendNativeCoin(args)
  } catch (error) {
    if ((error as WalletProviderError).code === 4001) throw new UserRejectedRequestError(error)
    throw error
  }
}
