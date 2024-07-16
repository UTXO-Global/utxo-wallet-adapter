import EventEmitter from 'eventemitter3';
import { Account, BalanceResult, SendNativeCoinPayload, SendNativeCoinResponse, SignMessagePayload, SignMessageResponse, SignPSBTPayload, SignPSBTResponse } from './types';
import { defaultChains } from '../chain';
import { equalsIgnoreCase } from '../../../src/utils/equalsIgnoreCase';
import { Chain, ChainType } from '../../../UTXOClient';
import { submitTxToBells, submitTxToMempool, submitTxToNervos } from '../utils/transaction';
export type ConnectorData<Provider = any> = {
  accounts?: Account[]
  network?: string
  provider?: Provider
}

export interface ConnectorEvents<Provider = any> {
  change(data: ConnectorData<Provider>): void
  connect(): void
  message({ type, data }: { type: string; data?: unknown }): void
  disconnect(): void
  error(error: Error): void
}

export interface ConnectorTransactionResponse {
  hash: string
}

export abstract class Connector<Provider = any, Options = any> extends EventEmitter<ConnectorEvents<Provider>> {
  abstract id: string
  abstract name: string
  abstract extensionURL: string
  readonly chains: Chain[]
  readonly options?: Options
  abstract readonly ready: boolean

  constructor({ chains = defaultChains, options }: { chains?: Chain[], options?: Options }) {
    super()
    this.chains = chains
    this.options = options
  }

  abstract connect(config?: { networkName?: string }): Promise<Required<ConnectorData>>
  abstract disconnect(): Promise<void>
  abstract isConnected(): Promise<boolean>
  abstract switchNetwork(network: string): Promise<void>
  abstract signMessage(SignMessagePayload: SignMessagePayload): Promise<SignMessageResponse>
  abstract sendNativeCoin(args: SendNativeCoinPayload): Promise<SendNativeCoinResponse>
  abstract signPSBT(args: SignPSBTPayload): Promise<SignPSBTResponse>
  abstract getBalances(accounts?: Account[], chain?: Chain): Promise<BalanceResult[]>

  isChainUnsupported(networkName: string) {
    return !this.chains.some((x) => equalsIgnoreCase(x.network, networkName))
  }

  protected submitTx = async (rawTx: string, chain: Chain) => {
    if (chain.type === ChainType.Bitcoin) {
      return await submitTxToMempool(rawTx, chain.apiUrl)
    } else if (chain.type === ChainType.Bells) {
      return await submitTxToBells(rawTx, chain.apiUrl)
    } else if (chain.type == ChainType.Nervos) {
      return await submitTxToNervos(rawTx, chain.rpc)
    }
  }
}