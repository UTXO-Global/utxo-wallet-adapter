"use client";

import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork, useClient, useBalances } from "@utxo-global/utxo-wallet-adapter";
import { UnisatConnector } from "@utxo-global/utxo-wallet-adapter/connectors/unisat";
import { useEffect, useMemo, useState } from "react";
import { truncateAddress } from "../utils"
import { XverseConnector } from "@utxo-global/utxo-wallet-adapter/connectors/xverse";
import { UtxoGlobalConnector, UtxoGlobalBitcoinConnector, UtxoGlobalCKBConnector } from "@utxo-global/utxo-wallet-adapter/connectors/utxo-global";
import SignMessage from "../components/SignMessage"
import SendNativeCoin from "../components/SendNativeCoin"
import SignPSBT from "../components/SignPsbt"

export default function Home() {

  const [tab, setTab] = useState("account");
  const [network, setNetwork] = useState("")
  const { connect, connectors } = useConnect();
  const { accounts, isConnected } = useAccount();
  const { disconnect } = useDisconnect()
  const { chain, chains } = useNetwork()
  const { switchNetwork } = useSwitchNetwork();
  const { connector } = useClient();
  const { data: balances_, error } = useBalances({
    watch: true
  })

  const balances = useMemo(() => {
    if (!balances_) return {}
    if (balances_.length === 0) return {}

    let results: any = {}
    balances_.map((b) => {
      console.log(b)
      results[b.address] = b
    })

    return results
  }, [balances_])

  useEffect(() => {
    if (chain) {
      setNetwork(chain.network)
    }
  }, [chain])

  useEffect(() => {
  }, [accounts])

  const Account = () => {
    return <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full justify-between items-center">
          <div className="capitalize text-2xl text-[#c02525] font-bold">{connector?.name} Wallet - <span className="text-lg">{chain?.name}</span> </div>
          <button
            className="bg-[#ffc107] text-[#333] py-3 px-5 rounded-lg text-xl"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {
            accounts?.map((acc: any, idx: number) => <div key={`acc-${idx}`} className="flex flex-col w-full bg-[#dddfe1] py-3 px-5 rounded">
              <a href={`${chain?.explorerAddress}/${acc.address}`} target="_blank">{truncateAddress(acc.address)}</a>
              <div className="text-sm">PublicKey: {truncateAddress(acc.publicKey, 20)}</div>
              <div className="flex gap-1 justify-between items-center">
                <span className="text-sm">{acc.type} {acc.purpose}</span>
                <div>{balances[acc.address] ? balances[acc.address].total / 10 ** 8 : "-"} {chain?.symbol}</div>
              </div>
            </div>)
          }
        </div>
      </div>
      <div className="flex gap-10 items-center w-full justify-between mt-10">
        <label className="text-2xl font-bold">Network</label>
        <select className="border-b-[1px] border-[#333] py-3 px-5 rounded-lg cursor-pointer" value={network} onChange={(e) => setNetwork(e.target.value)}>
          {
            chains.map((c) => <option key={`chain-${c.name}`} value={c.network}>{c.name}</option>)
          }
        </select>
        <button
          className="bg-[#198754] text-[#FFF] py-3 px-5 rounded-lg text-xl"
          onClick={() => switchNetwork(network)}
        >
          Change
        </button>
      </div>
    </>
  }

  const Connect = () => {
    const xverse = new XverseConnector()
    return <div className="flex flex-col gap-4">
      <button
        className="bg-[#000000] text-[#FFF] text-xl py-3 px-5 rounded-lg flex justify-between items-center gap-10"
        onClick={() => connect({
          connector: new UnisatConnector(),
        })}
      >
        <img src="https://testnet.unisat.io/logo/logo_unisat.svg" className="h-5" />
        &rarr;
      </button>
      <button
        className="bg-[#000000] text-[#FFF] text-xl py-3 px-5 rounded-lg flex justify-between items-center gap-10 h-[64px]"
        onClick={() => connect({
          connector: xverse,
          networkName: "testnet"
        })}
      >
        <img className="h-4" src="https://cdn.prod.website-files.com/624b08d53d7ac60ccfc11d8d/645d01e85e0969992e9e4caa_Full_Logo.webp" />
        &rarr;
      </button>
      <button
        className="bg-[#000000] text-[#FFF] text-xl py-3 px-5 rounded-lg flex justify-between items-center gap-2"
        onClick={() => connect({
          connector: new UtxoGlobalBitcoinConnector(),
        })}
      >
        <img className="h-8" src="utxo.png" />
        <span>UTXO Global BTC</span>
        &rarr;
      </button>
      <button
        className="bg-[#000000] text-[#FFF] text-xl py-3 px-5 rounded-lg flex justify-between items-center gap-2"
        onClick={() => connect({
          connector: new UtxoGlobalCKBConnector(),
        })}
      >
        <img className="h-8" src="utxo.png" />
        <span>UTXO Global CKB</span>
        &rarr;
      </button>
    </div>
  }

  return <div className="w-full min-h-dvh flex flex-col p-10">
    <div className="flex gap-10 text-lg border-b-[1px] w-full justify-center p-5 mb-10 font-bold">
      <button onClick={() => setTab("account")}>Account</button>
      <button onClick={() => setTab("signMessage")}>Sign Message</button>
      <button onClick={() => setTab("signPSBT")}>Sign PSBT</button>
      <button onClick={() => setTab("sendNativeCoin")}>Send Native Coin</button>
    </div>
    <div className="w-[500px] flex justify-center mx-auto">
      {!isConnected ?
        <Connect /> :
        <div className="flex flex-col gap-5 text-xl w-full">
          {tab === "account" && <Account />}
          {tab === "signMessage" && <SignMessage />}

          {
            tab === "signPSBT" && <SignPSBT />
          }

          {tab === "sendNativeCoin" && <SendNativeCoin />}
        </div>
      }
    </div>
  </div>
}
