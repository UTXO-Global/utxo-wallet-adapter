import { Chain } from "../../../UTXOClient"

export type BalanceResult = {
  address: string
  confirmed: number
  total: number
  unconfirmed: number
}

export type BalancePayload = {
  accounts?: Account[]
  chain?: Chain
}

export type Account = {
  address: string
  publicKey: string
  type: string
  purpose: string
}

export interface SignMessagePayload {
  address?: string // Should we include the address of the account in the message
  application?: boolean // Should we include the domain of the dapp
  chainId?: boolean // Should we include the current chain id the wallet is connected to
  message: string // The message to be signed and displayed to the user
}

export interface SignMessageResponse {
  message: string
  signature: string
  error?: any
}

export interface SendBTCOption {
  feeRate?: number
}
export interface SendNativeCoinPayload {
  senderAddress?: string
  addressTo: string
  amount: number
  options?: SendBTCOption
}

export interface SendNativeCoinResponse {
  txId?: string
  txHex?: string
  error?: any
}

export interface SignPSBTPayload {
  psbtBase64: string
  options: SignPSBTOptions
}

export interface SignPSBTResponse {
  txId?: string
  txHex?: string
  base64?: string
  error?: any
}

export interface SignPSBTOptions {
  signInputs: { index: number, address: string }[]
  autoFinalized: boolean
  broadcast: boolean
}

export interface UtxoGlobalAdapter { }

export enum WalletAdapterNetwork {
  Mainnet = 'mainnet',
  Testnet3 = 'testnet3',
  Testnet4 = 'testnet4',
  Signet = 'signet',
}