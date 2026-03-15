import {
  Horizon,
  SorobanRpc,
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
  BASE_FEE,
  Contract,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { InsufficientBalanceError } from "./errors";

export const CONTRACT_ID = "YOUR_CONTRACT_ID_HERE"; // ← paste yours
const NETWORK_PASSPHRASE = Networks.TESTNET;

const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
const sorobanServer = new SorobanRpc.Server("https://soroban-testnet.stellar.org");

// ─── XLM Balance ───────────────────────────────────────────────
export const fetchBalance = async (publicKey) => {
  const account = await horizonServer.loadAccount(publicKey);
  const xlm = account.balances.find((b) => b.asset_type === "native");
  return xlm ? parseFloat(xlm.balance).toFixed(2) : "0.00";
};

// ─── Send XLM ──────────────────────────────────────────────────
export const sendXLM = async (senderPublicKey, destination, amount, signTransaction) => {
  const balance = await fetchBalance(senderPublicKey);
  if (parseFloat(balance) < parseFloat(amount) + 0.1) {
    throw new InsufficientBalanceError();
  }

  const account = await horizonServer.loadAccount(senderPublicKey);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: String(amount),
      })
    )
    .setTimeout(30)
    .build();

  const signed = await signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  if (!signed) throw new Error("rejected");

  const tx = TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
  const result = await horizonServer.submitTransaction(tx);
  return result.hash;
};

// ─── Contract: increment counter ──────────────────────────────
export const incrementCounter = async (publicKey, signTransaction) => {
  const account = await sorobanServer.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("increment"))
    .setTimeout(30)
    .build();

  const prepared = await sorobanServer.prepareTransaction(transaction);
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  if (!signed) throw new Error("rejected");

  const tx = TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
  const result = await sorobanServer.sendTransaction(tx);
  return await pollTransaction(result.hash);
};

// ─── Contract: get counter ────────────────────────────────────
export const getCount = async () => {
  const contract = new Contract(CONTRACT_ID);
  const account = await sorobanServer.getAccount(
    "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN" // read-only public key
  );

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_count"))
    .setTimeout(30)
    .build();

  const result = await sorobanServer.simulateTransaction(transaction);
  return scValToNative(result.result.retval);
};

// ─── Contract: set message ────────────────────────────────────
export const setMessage = async (publicKey, message, signTransaction) => {
  const account = await sorobanServer.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("set_message", nativeToScVal(message, { type: "string" }))
    )
    .setTimeout(30)
    .build();

  const prepared = await sorobanServer.prepareTransaction(transaction);
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  if (!signed) throw new Error("rejected");

  const tx = TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
  const result = await sorobanServer.sendTransaction(tx);
  return await pollTransaction(result.hash);
};

// ─── Contract: get message ────────────────────────────────────
export const getMessage = async () => {
  const contract = new Contract(CONTRACT_ID);
  const account = await sorobanServer.getAccount(
    "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN"
  );

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_message"))
    .setTimeout(30)
    .build();

  const result = await sorobanServer.simulateTransaction(transaction);
  return scValToNative(result.result.retval);
};

// ─── Poll tx until success/fail ───────────────────────────────
export const pollTransaction = async (hash) => {
  for (let i = 0; i < 20; i++) {
    const status = await sorobanServer.getTransaction(hash);
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return hash;
    }
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain.");
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Transaction timed out.");
};
