import { UTXONetwork, UTXOScriptType } from "../types"

type networkAndScriptType = {
  [key: string]: {
    network: UTXONetwork;
    scriptType: UTXOScriptType;
    config: { private: number; public: number };
  };
};

// https://github.com/satoshilabs/slips/blob/master/slip-0132.md
export const networkAndScriptMap: networkAndScriptType = {
  xpub: {
    network: UTXONetwork.Mainnet,
    scriptType: UTXOScriptType.P2PKH,
    config: { private: 0x0488ade4, public: 0x0488b21e },
  },
  xprv: {
    network: UTXONetwork.Mainnet,
    scriptType: UTXOScriptType.P2PKH,
    config: { private: 0x0488ade4, public: 0x0488b21e },
  },
  ypub: {
    network: UTXONetwork.Mainnet,
    scriptType: UTXOScriptType.P2SH_P2WPKH,
    config: { private: 0x049d7878, public: 0x049d7cb2 },
  },
  yprv: {
    network: UTXONetwork.Mainnet,
    scriptType: UTXOScriptType.P2SH_P2WPKH,
    config: { private: 0x049d7878, public: 0x049d7cb2 },
  },
  zpub: {
    network: UTXONetwork.Mainnet,
    scriptType: UTXOScriptType.P2WPKH,
    config: { private: 0x04b2430c, public: 0x04b24746 },
  },
  zprv: {
    network: UTXONetwork.Mainnet,
    scriptType: UTXOScriptType.P2WPKH,
    config: { private: 0x04b2430c, public: 0x04b24746 },
  },
  tpub: {
    network: UTXONetwork.Testnet,
    scriptType: UTXOScriptType.P2PKH,
    config: { private: 0x04358394, public: 0x043587cf },
  },
  tprv: {
    network: UTXONetwork.Testnet,
    scriptType: UTXOScriptType.P2PKH,
    config: { private: 0x04358394, public: 0x043587cf },
  },
  upub: {
    network: UTXONetwork.Testnet,
    scriptType: UTXOScriptType.P2SH_P2WPKH,
    config: { private: 0x044a4e28, public: 0x044a5262 },
  },
  uprv: {
    network: UTXONetwork.Testnet,
    scriptType: UTXOScriptType.P2SH_P2WPKH,
    config: { private: 0x044a4e28, public: 0x044a5262 },
  },
  vpub: {
    network: UTXONetwork.Testnet,
    scriptType: UTXOScriptType.P2WPKH,
    config: { private: 0x045f18bc, public: 0x045f1cf6 },
  },
  vprv: {
    network: UTXONetwork.Testnet,
    scriptType: UTXOScriptType.P2WPKH,
    config: { private: 0x045f18bc, public: 0x045f1cf6 },
  },
};

export const detectNetworkAndScriptType = (extendedPubKey: string) => {
  const keyPrefix = Object.keys(networkAndScriptMap).find(
    (each) => extendedPubKey.slice(0, 4) === each
  );

  if (keyPrefix) {
    return networkAndScriptMap[keyPrefix];
  }
  throw new Error("Unknown network or script Type");
};

export const detectNetworkAndScriptTypeByAddress = (address: string) => {
  // Mainnet
  if (address.startsWith("1")) {
    return {
      network: UTXONetwork.Mainnet,
      scriptType: UTXOScriptType.P2PKH,
    };
  }

  if (address.startsWith("3")) {
    return {
      network: UTXONetwork.Mainnet,
      scriptType: UTXOScriptType.P2SH_P2WPKH,
    };
  }

  if (address.startsWith("bc1q")) {
    return {
      network: UTXONetwork.Mainnet,
      scriptType: UTXOScriptType.P2WPKH,
    };
  }

  if (address.startsWith("bc1p")) {
    return {
      network: UTXONetwork.Mainnet,
      scriptType: UTXOScriptType.P2TR,
    };
  }

  if (address.startsWith("ckb")) {
    return {
      network: UTXONetwork.Mainnet,
      scriptType: UTXOScriptType.CKB,
    };
  }

  // Testnet
  if (address.startsWith("m") || address.startsWith("n")) {
    return {
      network: UTXONetwork.Testnet,
      scriptType: UTXOScriptType.P2PKH,
    };
  }

  if (address.startsWith("2")) {
    return {
      network: UTXONetwork.Testnet,
      scriptType: UTXOScriptType.P2SH_P2WPKH,
    };
  }

  if (address.startsWith("tb1q")) {
    return {
      network: UTXONetwork.Testnet,
      scriptType: UTXOScriptType.P2WPKH,
    };
  }

  if (address.startsWith("tb1p")) {
    return {
      network: UTXONetwork.Testnet,
      scriptType: UTXOScriptType.P2TR,
    };
  }

  if (address.startsWith("ckt")) {
    return {
      network: UTXONetwork.Testnet,
      scriptType: UTXOScriptType.CKB,
    };
  }

  throw new Error("Unknown network or script Type");
};