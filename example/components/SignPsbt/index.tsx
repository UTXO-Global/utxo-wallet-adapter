import React, { useEffect, useState } from "react";
import { useAccount, useSignPsbt } from "@utxo-global/utxo-wallet-adapter";
import { truncateAddress } from "@/utils";
export default function SignPSBT() {
    const [psbtB64, setPsbtB64] = useState("");
    const { data, isSuccess, signPspt } = useSignPsbt();
    const { accounts, isConnected } = useAccount();
    const [senderAddress, setSenderAddress] = useState("")

    useEffect(() => {
        if (isSuccess) console.log(data)
    }, [isSuccess])

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            setSenderAddress(accounts[0].address)
        }
    }, [accounts])

    return <div className="flex flex-col gap-5">
        <label className="text-2xl font-bold">SignPSBT</label>
        <div className="flex gap-10 items-center w-full justify-between">
            <label>Sender</label>
            <select className="py-3 px-5 cursor-pointer" value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)}>
                {
                    accounts?.map((a) => <option key={`sign-psbt-${a.address}`} value={a.address}>{truncateAddress(a.address)}</option>)
                }
            </select>
        </div>
        <input placeholder="Input PSBT here" className="border-b-[1px] resize-none p-2 outline-none" onChange={(e) => setPsbtB64(e.target.value)} />
        <button
            className="bg-[#198754] text-[#FFF] py-3 px-5 rounded-lg text-xl"
            onClick={() => {
                if (accounts) {
                    signPspt({
                        psbtBase64: psbtB64,
                        options: {
                            signInputs: [{ address: senderAddress, index: 0 }],
                            autoFinalized: true,
                            broadcast: true
                        }
                    })
                }
            }}
        >
            Sign PSBT
        </button>
    </div>
}