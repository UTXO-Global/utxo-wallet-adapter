import { ConnectorNotFoundError, WalletProviderError, UserRejectedRequestError } from '../errors'
import { getClient } from '../client'
import { SignMessagePayload, SignMessageResponse } from '../connectors'

export type SignMessageResult = SignMessageResponse

export async function signMessage(args: SignMessagePayload): Promise<SignMessageResult> {
  try {
    const client = getClient()
    const activeConnector = client.connector
    if (!activeConnector) throw new ConnectorNotFoundError()
    return activeConnector.signMessage(args)
  } catch (error) {
    if ((error as WalletProviderError).code === 4001) throw new UserRejectedRequestError(error)
    throw error
  }
}
