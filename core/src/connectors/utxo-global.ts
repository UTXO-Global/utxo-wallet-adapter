import { Buffer } from "bitcoinjs-lib/src/types"
import { Chain } from "../../../UTXOClient"
import { bellMainnet, mainnet, nervosMainnet, nervosTestnet, signet, testnet3, testnet4 } from "../chain"
import { ConnectorNotFoundError } from "../errors"
import { PurposeType, UTXONetworkType, UTXOScriptType } from "../types"
import { detectNetworkAndScriptTypeByAddress } from "../utils/bitcoin"
import { Connector } from "./base"
import { Account, BalanceResult, SendNativeCoinPayload, SendNativeCoinResponse, SignMessagePayload, SignMessageResponse, SignPSBTOptions, SignPSBTPayload, SignPSBTResponse } from "./types"

declare global {
  interface Window {
    utxoGlobal?: any
  }
}

const CHAINS = {
  ["btc"]: mainnet,
  ["btc_testnet"]: testnet3,
  ["btc_testnet_4"]: testnet4,
  ["btc_signet"]: signet,
  ["bellschain"]: bellMainnet,
  ["nervos"]: nervosMainnet,
  ["nervos_testnet"]: nervosTestnet
}

export class UtxoGlobalConnector extends Connector {
  readonly id = 'utxoGlobal'
  readonly name = 'utxoGlobal'
  readonly extensionURL = 'https://chromewebstore.google.com/detail/nmgnlkffaoepjbalplalblejpibaddek'
  provider?: Window['utxoGlobal']

  readonly ready = typeof window !== 'undefined' && !!window.utxoGlobal
  constructor(options: { chains?: Chain[], options?: {} } = {}) {
    if (!options.chains) {
      options.chains = [mainnet, testnet3, testnet4, signet, bellMainnet, nervosMainnet, nervosTestnet]
    }
    super(options)
  }

  async getProvider() {
    if (typeof window !== 'undefined' && !!window.utxoGlobal) this.provider = window.utxoGlobal
    return this.provider
  }

  async isConnected() {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      return await provider.isConnected()
    } catch {
      return false
    }
  }

  async disconnect() {
    return
  }

  async getAccounts(): Promise<Account[] | undefined> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()

    let results: Account[] = [];
    try {
      window?.utxoGlobal?.removeListener("accountsChanged", this.onAccountsChanged);
    } catch (_) { }

    try {
      const _network = await provider._network as string;
      const accounts = await provider.getAccount()
      const pubKeys = await provider.getPublicKey()
      results = accounts.map((_address: string) => {
        const _obj = pubKeys.find((pubkey: any) => pubkey.address === _address)
        const _account = {
          publicKey: _obj ? _obj.publicKey : "",
          address: _address,
          type: "",
          purpose: ""
        }
        if (_network === UTXONetworkType.BellsMainnet) {
          _account.type = UTXOScriptType.P2PKH
        } else {
          const addressDetect = detectNetworkAndScriptTypeByAddress(_account.address);
          if (addressDetect) {
            _account.type = addressDetect.scriptType
          }
        }
        return _account
      })
    } catch (e: any) {
      throw e
    }

    if (results.length > 1) {
      results[results.length - 1].purpose = PurposeType.Ordinals
      results[results.length - 2].purpose = PurposeType.Payment
    } else if (results.length > 0) {
      results[results.length - 1].purpose = PurposeType.Payment
    }

    return results
  };

  async getBalances(): Promise<BalanceResult[]> {
    const accounts = await this.getAccounts()
    const provider = await this.getProvider()
    if (!provider) {
      throw new ConnectorNotFoundError()
    }

    const balances = await provider.getBalance() as [];
    const results: BalanceResult[] = []
    balances.map((value_, i) => {
      const value = Number(value_)
      results.push({
        address: accounts[i].address,
        total: value,
        confirmed: value,
        unconfirmed: 0,
      })
    })

    return results
  }

  async connect() {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()

      this.emit('message', { type: 'connecting' })

      await provider.connect()
      const accounts = await this.getAccounts()
      const _network = await provider._network as string;
      const chain = CHAINS[_network]

      return {
        accounts,
        network: chain.network,
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
      return {
        signature: (await provider.signMessage(payload.message, payload.address)) as string,
        message: payload.message
      };
    } catch (e) {
      console.log(e)
      return { signature: "", message: payload.message, error: e };
    }
  };

  async sendNativeCoin(args: SendNativeCoinPayload): Promise<SendNativeCoinResponse> {
    try {
      const provider = await this.getProvider()
      if (!provider) {
        throw new ConnectorNotFoundError()
      }

      const _network = await provider._network as string;
      const chain = CHAINS[_network]
      let amount = args.amount
      let rawTx = await provider.createTx({ to: args.addressTo, amount: amount, feeRate: args.options.feeRate!, receiverToPayFee: false });
      const { txId } = await this.submitTx(`${rawTx}`, chain)
      return {
        txId: txId!
      };
    } catch (e) {
      console.log(e)
      return { error: e }
    }
  }

  async signPSBT(args: SignPSBTPayload): Promise<SignPSBTResponse> {
    const provider = await this.getProvider()
    if (!provider) throw new ConnectorNotFoundError()

    const _network = await provider._network as string;
    const chain = CHAINS[_network]
    const options = args.options
    const response = await provider.signPsbt(args.psbtBase64, {
      autoFinalized: options.autoFinalized,
      toSignInputs: options.signInputs,
    });

    await this.submitTx(response.psbtHex, chain);
    return {
      txId: response.txId,
      txHex: response.psbtHex,
      base64: Buffer.from(response.psbtHex, "hex").toString("base64"),
    }
  }

  protected onAccountsChanged = async (account: any) => {
    if (account && !!account.address) {
      this.emit('change', {
        accounts: await this.getAccounts(),
      })
    } else {
      this.emit('disconnect')
    }
  }

  protected onNetworkChanged = (network: string) => {
    this.emit('change', {
      network: network,
    })
  }
}
