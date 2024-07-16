import { ChainMismatchError, ConnectorNotFoundError } from "../errors"
import { Connector } from "./base"
import { Account, BalanceResult, SendNativeCoinPayload, SendNativeCoinResponse, SignMessagePayload, SignMessageResponse, SignPSBTOptions, SignPSBTPayload, SignPSBTResponse } from "./types"
import { detectNetworkAndScriptTypeByAddress } from "../utils/bitcoin";
import { mainnet, testnet3 } from "../chain";
import { Chain } from "../../../UTXOClient";

declare global {
  interface Window {
    unisat?: any
  }
}

const CHAINS = {
  ["livenet"]: mainnet,
  ["testnet"]: testnet3,
}

export class UnisatConnector extends Connector {
  readonly id = 'unisat'
  readonly name = 'unisat'
  readonly extensionURL = 'https://chromewebstore.google.com/detail/ppbibelpcjmhbdihakflkdcoccbgbkpo'
  provider?: Window['unisat']
  readonly ready = typeof window !== 'undefined' && !!window.unisat

  constructor(options: { chains?: Chain[] } = {}) {
    if (!options.chains) {
      options.chains = [mainnet, testnet3]
    }

    super(options)
  }
  async isConnected() {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      return provider._isConnected
    } catch {
      return false
    }
  }

  async disconnect() {
    return
  }

  async getProvider() {
    if (typeof window !== 'undefined' && !!window.unisat) {
      this.provider = window.unisat
    }
    return this.provider
  }

  async getAccounts(): Promise<Account[] | undefined> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()

    const result: Account[] = [];
    try {
      window?.unisat?.removeListener("accountsChanged", this.onAccountsChanged);
      window?.unisat?.removeListener("networkChanged", this.onNetworkChanged);
    } catch (_) { }

    try {
      const accounts: any[] = await this.provider.getAccounts();
      const addressDetect = detectNetworkAndScriptTypeByAddress(accounts[0]);
      result.push({
        publicKey: await this.provider.getPublicKey(),
        address: accounts[0],
        type: addressDetect.scriptType,
        purpose: ""
      })
      window?.unisat?.addListener("accountsChanged", this.onAccountsChanged);
      window?.unisat?.addListener("networkChanged", this.onNetworkChanged);
    } catch (e) {
      console.log(e);
    }

    return result;
  };

  async getBalances(): Promise<BalanceResult[]> {
    const provider = await this.getProvider()
    if (!provider) {
      throw new ConnectorNotFoundError()
    }

    const balance = await provider.getBalance() as {
      confirmed: number,
      unconfirmed: number,
      total: number
    };

    const selectedAddress = await provider._selectedAddress
    const results: BalanceResult[] = [
      {
        address: selectedAddress,
        total: balance?.total,
        confirmed: balance?.confirmed,
        unconfirmed: balance?.unconfirmed,
      }
    ]

    return results
  }

  async connect() {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()

      this.emit('message', { type: 'connecting' })

      await provider.requestAccounts()
      const accounts = await this.getAccounts()
      const network = await provider.getNetwork();

      return {
        accounts,
        network,
        provider,
      }
    } catch (error) {
      throw error
    }
  }

  async switchNetwork(network: string) {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      const activeNetwork = await provider.getNetwork();
      if (this.isChainUnsupported(network)) {
        throw new ChainMismatchError({ activeChain: activeNetwork, targetChain: network })
      }
      return await provider.switchNetwork(network);
    } catch (error) {
      throw error
    }
  };

  async signMessage(payload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      return {
        signature: (await provider.signMessage(payload.message)) as string,
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

      const amount = args.amount * 10 ** 8
      let txid = await provider.sendBitcoin(args.addressTo, amount, args.options);
      return {
        txId: txid
      };
    } catch (e) {
      console.log(e)
      return { error: e }
    }
  }

  async signPSBT(args: SignPSBTPayload): Promise<SignPSBTResponse> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()
    const { Psbt } = await import("bitcoinjs-lib")
    const network = await provider.getNetwork()
    const unsignedPsbt = Psbt.fromBase64(args.psbtBase64);
    const options = args.options
    const psbtHex = await provider.signPsbt(unsignedPsbt.toHex(), {
      toSignInputs: options.signInputs,
    });
    const finalizedPsbt = Psbt.fromHex(psbtHex);
    const txHex = finalizedPsbt.extractTransaction().toHex();
    const chain = CHAINS[network]
    const res = await this.submitTx(txHex, chain);
    return {
      txId: res.txId,
      txHex: txHex
    }
  }

  protected onAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      const addressDetect = detectNetworkAndScriptTypeByAddress(
        accounts[0]
      );

      if (!addressDetect) {
        this.emit('disconnect')
      } else {
        this.emit('change', {
          accounts: await this.getAccounts(),
        })
      }
    }
  }

  protected onNetworkChanged = (network: string) => {
    this.emit('change', {
      network: network,
    })
  }
}
