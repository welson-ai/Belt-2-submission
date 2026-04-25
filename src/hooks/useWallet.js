import { useState, useCallback } from "react";
import { parseError } from "../utils/errors";

const TESTNET = "Test SDF Network ; September 2015";
let initialized = false;
let Kit = null;

const ensureInit = async () => {
  if (initialized && Kit) return;

  const swk = await import("@creit.tech/stellar-wallets-kit");
  console.log("Stellar Wallets Kit exports:", Object.keys(swk));

  Kit = swk.StellarWalletsKit;

  // Find all module constructors — anything ending in "Module" or "Wallet"
  const moduleKeys = Object.keys(swk).filter(
    (k) => k !== "StellarWalletsKit" && (
      k.endsWith("Module") ||
      k.endsWith("Wallet") ||
      k.includes("Freighter") ||
      k.includes("xBull") ||
      k.includes("Lobstr") ||
      k.includes("Albedo") ||
      k.includes("Hana") ||
      k.includes("WalletConnect")
    )
  );

  console.log("Detected wallet modules:", moduleKeys);

  const modules = moduleKeys
    .map((k) => {
      try {
        const Mod = swk[k];
        if (typeof Mod === "function") return new Mod();
        return null;
      } catch (e) {
        console.warn(`Could not instantiate ${k}:`, e);
        return null;
      }
    })
    .filter(Boolean);

  // Fallback: try allowAllModules
  if (modules.length === 0 && typeof swk.allowAllModules === "function") {
    modules.push(...swk.allowAllModules());
  }

  console.log("Modules loaded:", modules.length, modules);

  if (modules.length === 0) {
    throw new Error("No wallet modules found. Cannot init StellarWalletsKit.");
  }

  Kit.init({
    network: TESTNET,
    modules,
  });

  initialized = true;
};

export const useWallet = () => {
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState("");

  const connect = useCallback(async () => {
    try {
      setError("");
      await ensureInit();

      const result = await Kit.authModal();
      console.log("authModal result:", result);

      const key = result?.address;
      if (!key) throw new Error("No address returned");
      setPublicKey(key);

    } catch (e) {
      if (e?.code === -1) return;
      console.error("Connect error:", e);
      setError(parseError(e).message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await Kit?.disconnect();
    } catch (e) {
      console.warn("Disconnect:", e);
    }
    setPublicKey(null);
    setError("");
  }, []);

  const signTransaction = useCallback(async (xdr, opts) => {
    try {
      const result = await Kit.signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase || TESTNET,
      });
      return result?.signedTxXdr || result;
    } catch (e) {
      throw parseError(e);
    }
  }, []);

  return { publicKey, connect, disconnect, signTransaction, error };
};
