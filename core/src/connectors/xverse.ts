import { Chain } from "../../../UTXOClient"
import { mainnet, signet, testnet3 } from "../chain"
import { ConnectorNotFoundError } from "../errors"
import { UTXONetworkType } from "../types"
import { getBalance } from "../utils/account"
import { Connector } from "./base"
import { Account, BalanceResult, SendNativeCoinPayload, SendNativeCoinResponse, SignMessagePayload, SignMessageResponse, SignPSBTOptions, SignPSBTPayload, SignPSBTResponse } from "./types"

const NETWORKS = {
  [UTXONetworkType.Mainnet]: "Mainnet",
  [UTXONetworkType.Testnet3]: "Testnet",
  [UTXONetworkType.Signet]: "Signet",
};

export class XverseConnector extends Connector {
  readonly providerId = "XverseProviders.BitcoinProvider";
  readonly id = 'xverse'
  readonly name = 'xverse'
  readonly extensionURL = 'https://chromewebstore.google.com/detail/idnnbdplmphpflfnlkomgpfbpcgelopg'
  provider?: any;
  network: any;
  ready: boolean;

  constructor(options: { chains?: Chain[], network?: any } = {}) {
    if (!options.chains) {
      options.chains = [mainnet, testnet3, signet]
    }

    options.network = NETWORKS[options.network] || undefined
    super(options)
    this.ready = this.checkReady()
    this.network = options.network
  }

  async isConnected() {
    return false
  }

  async disconnect() { }

  async getProvider() {
    if (!this.provider) {
      const Wallet = await import('sats-connect')
      this.provider = Wallet
      if (!this.provider) throw new ConnectorNotFoundError()
      return this.provider
    }

    return this.provider
  }

  async getAccounts(): Promise<Account[] | undefined> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()
    const { AddressPurpose } = await import("sats-connect")
    const result: Account[] = [];
    try {
      const response = await provider.request('getAccounts', {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: 'dApp Connect',
      });

      if (response.status === 'success') {
        response.result.map((account) => {
          result.push({
            address: account.address,
            publicKey: account.publicKey,
            purpose: account.purpose,
            type: account.addressType
          })
        })
      } else if (response.error) {
        throw response.error
      }
    } catch (err: any) {
      throw err;
    }

    return result;
  };

  async getBalances(accounts?: Account[], chain?: Chain): Promise<BalanceResult[]> {
    const provider = await this.getProvider()
    if (!provider) {
      throw new ConnectorNotFoundError()
    }

    let results: BalanceResult[] = [];

    accounts?.map(async (account) => {
      const balance = await getBalance(account.address, chain.apiUrl);
      results.push({
        address: account.address,
        total: balance.chain,
        confirmed: balance.chain,
        unconfirmed: balance.mempool,
      })
    });

    return results
  }

  async connect({ networkName }) {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()

      this.emit('message', { type: 'connecting' })

      const accounts = await this.getAccounts()

      return {
        accounts,
        network: networkName,
        provider,
      }
    } catch (error) {
      throw error
    }
  }

  async switchNetwork(network: string) { };

  async signMessage(payload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      let signedHash = "";


      const response = await provider.request("signMessage", {
        address: payload.address,
        message: payload.message,
      });

      if (response.status === "success") {
        signedHash = response.result.signature
      } else if (response.error) {
        throw response.error
      }

      return {
        signature: signedHash,
        message: payload.message
      };
    } catch (e) {
      return { signature: "", message: payload.message, error: e };
    }
  };

  async sendNativeCoin(args: SendNativeCoinPayload): Promise<SendNativeCoinResponse> {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      let txId = "";
      const amount = args.amount * 10 ** 8
      const response = await provider.request("sendTransfer", {
        recipients: [
          {
            address: args.addressTo,
            amount: Number(amount),
          },
        ],
      });
      if (response.status === "success") {
        txId = response.result.txid
      } else if (response.error) {
        throw response.error
      }

      return {
        txId: txId
      };
    } catch (e) {
      return { error: e }
    }
  }

  async signPSBT(args: SignPSBTPayload): Promise<SignPSBTResponse> {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()

      const options = args.options
      const signInputs = {}
      options.signInputs.map(x => {
        signInputs[x.address] = [x.index]
      })

      const response = await provider.request("signPsbt", {
        psbt: args.psbtBase64,
        broadcast: options.broadcast,
        signInputs: signInputs,
      });

      if (response.status === "success") {
        return {
          txId: response.result.txid
        }
      } else if (response.error) {
        throw response.error
      }
    } catch (err) {
      console.log(err)
      throw err
    }
    return {}
  }

  protected checkReady = () => {
    if (typeof window !== 'undefined' && window.btc_providers) {
      const provider = window?.btc_providers?.find(provider => provider.id === this.providerId)  
      return provider !== undefined
    }
    return false
  };
}
