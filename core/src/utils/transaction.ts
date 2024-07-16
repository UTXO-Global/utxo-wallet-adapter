import { camelToSnakeCase } from ".";

export const submitTxToNervos = async (rawTx: string, rpc:string) => {
    const _rawTx = camelToSnakeCase(rawTx)
    const tx = JSON.parse(_rawTx)
    const response = await fetch(`${rpc}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "id": 0,
            "jsonrpc": "2.0",
            "method": "send_transaction",
            "params": [tx]
        }),
    });

    if (response.ok) {
        const { result } = JSON.parse(await response.text());
        return { txId: result };
    } else {
        return { error: new Error(`Unknown Error`) };
    };
}

export const submitTxToBells = async (rawTx: string, apiURL:string) => {
    const response = await fetch(`${apiURL}/tx`, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: rawTx,
    });

    if (response.ok) {
        const txId = await response.text();
        return { txId: txId };
    } else {
        return { error: new Error(`Unknown Error`) };
    };
}

export const submitTxToMempool = async (rawTx: string, apiURL:string) => {
const response = await fetch(`${apiURL}/tx`, {
    method: "POST",
    headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    },
    body: rawTx,
});

if (response.ok) {
    const txId = await response.text();
    return { txId: txId };
} else {
    return { error: new Error(`Unknown Error`) };
};
}