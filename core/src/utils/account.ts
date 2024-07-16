import { UTXONetwork } from "../types";

export const getBalance = async (address: string, mempoolAPIURL: string) => {
    try {
      const response = await fetch(`${mempoolAPIURL}/address/${address}`);
  
      if (response.ok) {
        const { chain_stats, mempool_stats } = await response.json();
        // Bitcoin Decimal = 8
        if (
          chain_stats &&
          chain_stats.funded_txo_sum !== undefined &&
          chain_stats.spent_txo_sum !== undefined
        ) {
          return {
            chain:
              (chain_stats.funded_txo_sum as number) -
              (chain_stats.spent_txo_sum as number),
            mempool:
              (mempool_stats.funded_txo_sum as number) -
              (mempool_stats.spent_txo_sum as number),
          };
        } else {
          return Promise.reject(new Error(`Cannot parse data`));
        }
      } else {
        return Promise.reject(new Error(`Unknown Error`));
      }
    } catch (error) {
      return {
        chain: 0,
        mempool: 0,
      };
    }
  };