export type Chain = {
  name: string;
  type: ChainType;
  network: string;
  explorer: string;
  explorerTx: string;
  explorerAddress: string;
  symbol: string;
  testnet?: boolean;
  faucetUrl?: string;
  apiUrl?: string;
  rpc?: string;
}

export enum ChainType {
  Bitcoin = "bitcoin",
  Bells = "bells",
  Nervos = "nervos",
}

export class UTXOClient {
  readonly chain: Chain
  constructor(chain: Chain) {
    this.chain = chain
  }
}