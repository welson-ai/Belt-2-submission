import { useState, useCallback, useRef } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  XBULL_ID,
  allowAllModules,
} from "@creit.tech/stellar-wallets-kit";
import { parseError } from "../utils/errors";

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export const useWallet = () => {
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState("");

  const connect = useCallback(async (walletId = FREIGHTER_ID) => {
    try {
      setError("");
      kit.setWallet(walletId);
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          if (!address) throw new Error("No address returned");
          setPublicKey(address);
        },
      });
    } catch (e) {
      const parsed = parseError(e);
      setError(parsed.message);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError("");
  }, []);

  const signTransaction = useCallback(async (xdr, opts) => {
    try {
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase,
      });
      return signedTxXdr;
    } catch (e) {
      const parsed = parseError(e);
      throw parsed;
    }
  }, []);

  return { publicKey, connect, disconnect, signTransaction, error };
};
