import { Chain, ChainType } from "../../UTXOClient";
import { UTXONetworkType } from "./types";

export const mainnet: Chain = {
    name: "Livenet",
    type: ChainType.Bitcoin,
    network: UTXONetworkType.Mainnet,
    symbol: "BTC",
    explorer: "https://mempool.space",
    explorerTx: "https://mempool.space/tx",
    explorerAddress: "https://mempool.space/address",
    apiUrl: "https://mempool.space/api",
}

export const testnet3: Chain = {
    name: "BTC Testnet 3",
    type: ChainType.Bitcoin,
    network: UTXONetworkType.Testnet3,
    symbol: "tBTC",
    explorer: "https://mempool.space/testnet",
    explorerTx: "https://mempool.space/testnet/tx",
    explorerAddress: "https://mempool.space/testnet/address",
    testnet: true,
    faucetUrl: "https://bitcoinfaucet.uo1.net/",
    apiUrl: "https://mempool.space/testnet/api",
}

export const testnet4: Chain = {
    name: "BTC Testnet 4",
    type: ChainType.Bitcoin,
    network: UTXONetworkType.Testnet4,
    symbol: "tBTC",
    explorer: "https://mempool.space/testnet4",
    explorerTx: "https://mempool.space/testnet4/tx",
    explorerAddress: "https://mempool.space/testnet4/address",
    testnet: true,
    faucetUrl: "https://mempool.space/testnet4/faucet",
    apiUrl: "https://mempool.space/testnet4/api",
}

export const signet: Chain = {
    name: "BTC Signet",
    type: ChainType.Bitcoin,
    network: UTXONetworkType.Signet,
    symbol: "sBTC",
    explorer: "https://mempool.space/signet",
    explorerTx: "https://mempool.space/signet/tx",
    explorerAddress: "https://mempool.space/signet/address",
    testnet: true,
    faucetUrl: "https://signetfaucet.com/",
    apiUrl: "https://mempool.space/signet/api",
}

export const nervosMainnet:Chain = {
    name: "Mirana Mainnet",
    type: ChainType.Nervos,
    network: UTXONetworkType.NervosMainnet,
    symbol: "CKB",
    explorer: "https://explorer.nervos.org",
    explorerTx: "https://explorer.nervos.org/transaction",
    explorerAddress: "https://explorer.nervos.org/address",
    apiUrl: "https://mainnet-api.explorer.nervos.org/api/v1",
    rpc: "https://mainnet.ckb.dev/rpc",
}

export const nervosTestnet:Chain = {
    name: "Pudge Testnet",
    type: ChainType.Nervos,
    network: UTXONetworkType.NervosTestnet,
    testnet: true,
    symbol: "CKB",
    explorer: "https://pudge.explorer.nervos.org/",
    explorerTx: "https://pudge.explorer.nervos.org/transaction",
    explorerAddress: "https://pudge.explorer.nervos.org/address",
    apiUrl: "https://testnet-api.explorer.nervos.org/api/v1",
    rpc: "https://testnet.ckb.dev/rpc",
    faucetUrl: "https://faucet.nervos.org"
}

export const defaultChains:Chain[] = [mainnet, testnet3, testnet4, signet];

export const defaultChain = mainnet;