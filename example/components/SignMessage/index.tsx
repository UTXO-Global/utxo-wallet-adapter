"use client"

import { useEffect, useState } from "react";
import { truncateAddress } from "../../utils"
import { useAccount, useSignMessage } from "@utxo-global/utxo-wallet-adapter";
import React from "react";

export default function SignMessage() {
    const [message, setMessage] = useState("Hello")
    const { accounts } = useAccount();
    const [senderAddress, setSenderAddress] = useState("")
    const { data, isSuccess, isPending, signMessage } = useSignMessage();

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            setSenderAddress(accounts[0].address)
        }
    }, [accounts])

    return <div className="flex flex-col gap-5">
        <label className="text-2xl font-bold">SignMessage</label>
        <div className="flex gap-10 items-center w-full justify-between">
            <label>Sender</label>
            <select className="py-3 px-5 cursor-pointer" value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)}>
                {
                    accounts?.map((a) => <option key={`send-native-coin-${a.address}`} value={a.address}>{truncateAddress(a.address)}</option>)
                }
            </select>
        </div>
        <input type="text" placeholder="Hello" value={message} onChange={(e) => setMessage(e.target.value)} className="border-b-[1px] outline-none" />
        <button
            className="bg-[#198754] text-[#FFF] py-3 px-5 rounded-lg text-xl disabled:grayscale"
            disabled={isPending}
            onClick={() => {
                signMessage({ message, address: senderAddress })
            }}
        >
            {isPending ? "Signing" : "Sign"}
        </button>
        {isSuccess && <div className="break-words mt-5">
            Signature: <br />
            {data.signature}
        </div>}
    </div>
}