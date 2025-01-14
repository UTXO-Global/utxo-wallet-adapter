import { UTXOClient } from "../../UTXOClient";
import { Connector, ConnectorData } from "./connectors/base";
import { ClientStorage, createStorage, noopStorage } from "./storage";
import { persist, subscribeWithSelector } from "zustand/middleware";
import create, { Mutate, StoreApi } from "zustand/vanilla";

export type ClientConfig<TProvider extends UTXOClient = UTXOClient> = {
  autoConnect?: boolean;
  connectors?: (() => Connector[]) | Connector[];
  storage?: ClientStorage;
  provider: ((config: { networkName?: string }) => TProvider) | TProvider;
};

export type Data = ConnectorData;
export type State<TProvider extends UTXOClient = UTXOClient> = {
  chains?: Connector["chains"];
  connector?: Connector;
  connectors: Connector[];
  data?: Data;
  error?: Error;
  provider: TProvider;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
};

const storeKey = "store";

export class Client<TProvider extends UTXOClient = UTXOClient> {
  config: Partial<ClientConfig<TProvider>>;
  storage: ClientStorage;
  store: Mutate<
    StoreApi<State<TProvider>>,
    [
      ["zustand/subscribeWithSelector", never],
      ["zustand/persist", Partial<State<TProvider>>]
    ]
  >;

  isAutoConnecting?: boolean;

  lastUsedConnector?: string | null;

  constructor({
    autoConnect = false,
    connectors = [],
    provider,
    storage = createStorage({
      storage:
        typeof window !== "undefined" ? window.localStorage : noopStorage,
    }),
  }: ClientConfig<TProvider>) {
    // Check status for autoConnect flag
    let status: State["status"] = "disconnected";
    let networkName: string | undefined;
    if (autoConnect) {
      try {
        const rawState = storage.getItem(storeKey, "");
        const data: Data | undefined = JSON.parse(rawState || "{}")?.state
          ?.data;
        // If account exists in localStorage, set status to reconnecting
        status = data?.accounts ? "reconnecting" : "connecting";
        networkName = data?.network;
        // eslint-disable-next-line no-empty
      } catch (_error) {}
    }

    // Create store
    this.store = create<
      State<TProvider>,
      [
        ["zustand/subscribeWithSelector", never],
        ["zustand/persist", Partial<State<TProvider>>]
      ]
    >(
      subscribeWithSelector(
        persist(
          () =>
            <State<TProvider>>{
              connectors:
                typeof connectors === "function" ? connectors() : connectors,
              provider:
                typeof provider === "function"
                  ? provider({ networkName })
                  : provider,
              status,
            },
          {
            name: storeKey,
            getStorage: () => storage,
            partialize: (state) => ({
              ...(autoConnect && {
                data: {
                  accounts: state?.data?.accounts,
                  network: state?.data?.network,
                },
              }),
              chains: state?.chains,
            }),
            version: 1,
          }
        )
      )
    );

    this.config = {
      autoConnect,
      connectors,
      provider,
      storage,
    };
    this.storage = storage;
    this.lastUsedConnector = storage?.getItem("wallet");
    this.addEffects();

    // eslint-disable-next-line no-return-await
    if (autoConnect && typeof window !== "undefined" && networkName)
      setTimeout(async () => await this.autoConnect(), 0);
  }

  get chains() {
    return this.store.getState().chains;
  }

  get connectors() {
    return this.store.getState().connectors;
  }
  get connector() {
    return this.store.getState().connector;
  }
  get data() {
    return this.store.getState().data;
  }
  get error() {
    return this.store.getState().error;
  }
  get lastUsedNetwork() {
    return this.data?.network;
  }
  get provider() {
    return this.store.getState().provider;
  }
  get status() {
    return this.store.getState().status;
  }
  get subscribe() {
    return this.store.subscribe;
  }

  setState(
    updater: State<TProvider> | ((state: State<TProvider>) => State<TProvider>)
  ) {
    const newState =
      typeof updater === "function" ? updater(this.store.getState()) : updater;
    this.store.setState(newState, true);
  }

  clearState() {
    this.setState((x) => ({
      ...x,
      chains: undefined,
      connector: undefined,
      data: undefined,
      error: undefined,
      status: "disconnected",
    }));
  }

  async destroy() {
    if (this.connector) await this.connector.disconnect?.();
    this.isAutoConnecting = false;
    this.clearState();
    this.store.destroy();
  }

  async autoConnect() {
    if (this.isAutoConnecting) return;
    if (!this.lastUsedConnector) return;
    this.isAutoConnecting = true;

    this.setState((x) => ({
      ...x,
      status: x.data?.accounts ? "reconnecting" : "connecting",
    }));

    // Try last used connector first
    const connector = [...this.connectors].find(
      (x) => x.id === this.lastUsedConnector
    );
    if (!connector) {
      this.setState((x) => ({
        ...x,
        data: undefined,
        status: "disconnected",
      }));
      return;
    }

    if (!connector.ready || !connector.isConnected) return;
    this.setState((x) => ({
      ...x,
      connector,
      chains: connector.chains,
      data: this.data,
      status: "connected",
    }));

    this.isAutoConnecting = false;
    return this.data;
  }

  setLastUsedConnector(lastUsedConnector: string | null = null) {
    this.storage?.setItem("wallet", lastUsedConnector);
  }

  addEffects() {
    const onChange = (data: Data) => {
      this.setState((x) => ({
        ...x,
        data: { ...x.data, ...data },
      }));
    };
    const onDisconnect = () => {
      this.clearState();
    };
    const onError = (error: Error) => {
      this.setState((x) => ({ ...x, error }));
    };

    this.store.subscribe(
      ({ connector }) => connector,
      (connector, prevConnector) => {
        prevConnector?.off?.("change", onChange);
        prevConnector?.off?.("disconnect", onDisconnect);
        prevConnector?.off?.("error", onError);

        if (!connector) return;
        connector.on?.("change", onChange);
        connector.on?.("disconnect", onDisconnect);
        connector.on?.("error", onError);
      }
    );

    const { provider } = this.config;
    const subscribeProvider = typeof provider === "function";

    if (subscribeProvider)
      this.store.subscribe(
        ({ data }) => data?.network,
        (networkName) => {
          this.setState((x) => ({
            ...x,
            provider: subscribeProvider
              ? provider({ networkName })
              : x.provider,
          }));
        }
      );
  }
}

// eslint-disable-next-line import/no-mutable-exports
export let client: Client<UTXOClient>;

export function createClient<TProvider extends UTXOClient = UTXOClient>(
  config: ClientConfig<TProvider>
) {
  const client_ = new Client<TProvider>(config);
  client = client_ as unknown as Client<UTXOClient>;
  return client_;
}

export function getClient<TProvider extends UTXOClient = UTXOClient>() {
  if (!client) {
    throw new Error("No UtxoReact client found");
  }
  return client as unknown as Client<TProvider>;
}
