# @utxo-global/utxo-wallet-adapter


## NOTICE (22 Nov 2024)
- We (UTXO Global team) recommend using CCC https://github.com/ckb-devrel/ccc for testing.

## Get Started

```bash
npm i @utxo-global/utxo-wallet-adapter @tanstack/react-query
```

## Run Example

```bash
npm i & npm run build
cd example
npm i & npm run dev
```

## Introduction

Connect to UTXO based-model chains with similar [wagmi](https://github.com/wagmi-dev/wagmi) React hooks.


#### Support Connectors:
Support Bitcoin Wallet Connectors:
- [x] Unisat
- [x] Xverse
- [x] UTXO Global Wallet
- [ ] OKX (Orbit/Moon)
- [ ] Leather
- [ ] Phantom
- [ ] Magic Eden

#### Example:
```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UtxoGlobalAdapterConfig, createClient, getDefaultProviders } from "@utxo-global/utxo-wallet-adapter";
import { UnisatConnector } from "@utxo-global/utxo-wallet-adapter/connectors/unisat";
import { XverseConnector } from "@utxo-global/utxo-wallet-adapter/connectors/xverse";
import { UtxoGlobalConnector } from "@utxo-global/utxo-wallet-adapter/connectors/utxo-global";

const client = createClient({
    autoConnect: true,
    provider: getDefaultProviders,
    connectors: [
        new UnisatConnector(),
        new XverseConnector(),
        new UtxoGlobalConnector()
    ],
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1_000 * 60 * 60 * 24, // 24 hours
            networkMode: 'offlineFirst',
            refetchOnWindowFocus: false,
            retry: 0,
        },
        mutations: {
            networkMode: 'offlineFirst',
        },
    },
})

function App() {
  return (
    <UtxoGlobalAdapterConfig client={client}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </UtxoGlobalAdapterConfig>
  )
}
```

### Connector

```jsx
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork, useClient, useBalances } from "@utxo-global/utxo-wallet-adapter";

function ConnectButton() {
  const { connect, connectors } = useConnect();

  return (
    <div>
      {connectors.map((connector) => (
        <button type="button" key={connector.id} onClick={() => connect({ connector})}>
          {connector.name}
        </button>
      ))}
    </div>
  )
}
```

### Hooks

```jsx
import { 
    useAccount, 
    useConnect, 
    useDisconnect, 
    useNetwork, 
    useSwitchNetwork, 
    useClient, 
    useBalances,
    useSignMessage,
    useSendNativeCoin
} from "@utxo-global/utxo-wallet-adapter";
```

#### Balance

```js
const { data } = useBalances({
  watch: true,
})
```

#### Sign Message

```js
const { data, isSuccess, isPending, signMessage } = useSignMessage();

signMessage({ message, address: senderAddress })

if (isSuccess) {
    console.log(data.signature)
}
```

#### Sign PSBT

```js
const { data, isSuccess, signPspt } = useSignPsbt();

signPspt({
  psbtBase64: psbtB64,
  options: {
    signInputs: [{ address: senderAddress, index: 0 }],
    autoFinalized: true,
    broadcast: true
  }
})

if (isSuccess) {
    console.log(data)
}
```

### Send Transaction

```js
const { data, isPending, isSuccess, sendNativeCoin } = useSendNativeCoin();

sendNativeCoin({ 
    addressTo, 
    amount: satAmount, 
    senderAddress: senderAddress, 
    options: {  feeRate: 10 } 
})

if (isSuccess) {
    console.log(data)
}
```
