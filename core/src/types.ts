export enum UTXOScriptType {
    P2SH = "P2SH",
    P2PKH = "P2PKH",
    P2SH_P2WPKH = "P2SH-P2WPKH",
    P2WPKH = "P2WPKH",
    P2TR = "P2TR",
    STACKS = "stacks",
    CKB = "CKB"
}

export enum UTXONetwork {
    Mainnet = 'livenet',
    Testnet = 'testnet'
}

export enum UTXONetworkType {
    Mainnet = 'livenet',
    Testnet3 = 'testnet',
    Testnet4 = 'testnet4',
    Signet = 'signet',
    BellsMainnet = "bellschain",
    NervosMainnet = 'nervos',
    NervosTestnet = 'nervos_testnet'
}

export enum PurposeType {
    Ordinals = "ordinals",
    Payment = "payment",
    Stacks = "stacks"
}

export const PurposeTypeMap = {
    [UTXOScriptType.P2TR]: "ordinals",
    [UTXOScriptType.P2PKH]: "payment",
    [UTXOScriptType.P2SH_P2WPKH]: "payment",
    [UTXOScriptType.P2WPKH]: "payment",
    [UTXOScriptType.P2SH]: "payment",
    [UTXOScriptType.STACKS]: "stacks"
}