export {
  ChainMismatchError,
  ChainNotConfiguredError,
  ConnectorAlreadyConnectedError,
  ConnectorNotFoundError,
  ConnectorUnauthorizedError,
  UserRejectedRequestError,
  defaultChain,
  defaultChains,
  getDefaultProviders,
} from '@utxoGlobalCore'

export * from "./client"
export * from "./context"
export * from "./hooks/useAccount"
export { useBalances } from "./hooks/useBalances"
export { useConnect, type UseConnectArgs, type UseConnectConfig } from './hooks/useConnect'
export { useDisconnect, type UseDisconnectConfig } from './hooks/useDisconnect'
export { useNetwork, useSwitchNetwork } from "./hooks/useNetwork"
export { useSignMessage } from "./hooks/useSignMessage"
export { useSignPsbt } from "./hooks/useSignPsbt"
export { useSendNativeCoin } from "./hooks/useSendNativeCoin"
export * from "./hooks/useProvider"