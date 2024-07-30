"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  UtxoGlobalAdapterConfig,
  createClient,
  getDefaultProviders,
} from "@utxo-global/utxo-wallet-adapter";
import { UnisatConnector } from "@utxo-global/utxo-wallet-adapter/connectors/unisat";
import { XverseConnector } from "@utxo-global/utxo-wallet-adapter/connectors/xverse";
import {
  UtxoGlobalBitcoinConnector,
  UtxoGlobalCKBConnector,
} from "@utxo-global/utxo-wallet-adapter/connectors/utxo-global";

const client = createClient({
  autoConnect: true,
  provider: getDefaultProviders,
  connectors: [
    new UnisatConnector(),
    new XverseConnector(),
    new UtxoGlobalBitcoinConnector(),
    new UtxoGlobalCKBConnector(),
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
      networkMode: "offlineFirst",
      refetchOnWindowFocus: false,
      retry: 0,
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UtxoGlobalAdapterConfig client={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </UtxoGlobalAdapterConfig>
  );
}
