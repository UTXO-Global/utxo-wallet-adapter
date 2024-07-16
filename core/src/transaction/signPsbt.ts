import { ConnectorNotFoundError, WalletProviderError, UserRejectedRequestError } from '../errors'
import { getClient } from '../client'
import { SignPSBTOptions, SignPSBTPayload, SignPSBTResponse } from '../connectors'

export type SignPsbtArgs ={
    payload: SignPSBTPayload
}

export async function signPsbt(args: SignPSBTPayload): Promise<SignPSBTResponse> {
  try {
    const client = getClient()
    if (!client.connector) throw new ConnectorNotFoundError()
    return client.connector.signPSBT(args)
  } catch (error) {
    if ((error as WalletProviderError).code === 4001) throw new UserRejectedRequestError(error)
    throw error
  }
}
