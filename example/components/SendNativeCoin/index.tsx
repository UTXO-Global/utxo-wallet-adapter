"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useAccount, useSendNativeCoin, useNetwork } from "@utxo-global/utxo-wallet-adapter";
import { truncateAddress } from "../../utils";

export default function SendNativeCoin() {
    const [senderAddress, setSenderAddress] = useState("")
    const [addressTo, setAddressTo] = useState("")
    const [amountInput, setAmountInput] = useState("0")
    const [satAmount, setSatAmount] = useState(0)
    const { data, isPending, isSuccess, sendNativeCoin } = useSendNativeCoin();
    const { accounts } = useAccount();
    const { chain } = useNetwork()


    useEffect(() => {
        console.log(data, isSuccess)
    }, [data, isSuccess])
    useEffect(() => {
        if (accounts && accounts.length > 0) {
            setSenderAddress(accounts[0].address)
        }
    }, [accounts])

    return <div className="flex flex-col gap-10">
        <label className="text-2xl font-bold">Send {chain?.symbol}</label>
        <div className="flex gap-10 items-center w-full justify-between">
            <label>Sender</label>
            <select className="py-3 px-5 cursor-pointer" value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)}>
                {
                    accounts?.map((a) => <option key={`send-native-coin-${a.address}`} value={a.address}>{truncateAddress(a.address)}</option>)
                }
            </select>
        </div>
        <input type="text" placeholder="Address To" className="border-b-[1px] outline-none" value={addressTo} onChange={(e) => setAddressTo(e.target.value)} />
        <div className="flex gap-5 justify-between border-b-[1px]">
            <input type="text" placeholder="0" className="w-full outline-none" value={amountInput} onChange={(e) => {
                setSatAmount(Number(e.target.value))
                setAmountInput(e.target.value)
            }} />
            <span>{chain?.symbol}</span>
        </div>

        <button
            className="bg-[#198754] text-[#FFF] py-3 px-5 rounded-lg text-xl disabled:grayscale"
            disabled={isPending}
            onClick={() => {
                sendNativeCoin({ addressTo, amount: satAmount, senderAddress: senderAddress, options: { feeRate: 10 } })
            }}
        >
            {isPending ? "Sending" : "Send"} {chain?.symbol}
        </button>
        {
            isSuccess && data && <div>
                <div>Transaction: </div>
                <a href={`${chain?.explorerTx}/${data.txId || data.txHex}`} target="_blank" className="underline mt-2 break-words">
                    {data.txId || data.txHex}
                </a>
            </div>
        }
    </div>
}