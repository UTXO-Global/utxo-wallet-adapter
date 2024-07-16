import { getClient } from "../client"
import { BalancePayload, BalanceResult } from "../connectors"
import { ConnectorNotFoundError } from "../errors"

export async function fetchBalance(args: BalancePayload): Promise<BalanceResult[]> {
  const client = getClient()
  if (!client.connector) {
    throw new ConnectorNotFoundError()
  }

  const activeConnector = client.connector
  const balances = await activeConnector.getBalances(args.accounts, args.chain)
  return balances
}
