import {
  Horizon,
  rpc,
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
  BASE_FEE,
  Contract,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

import { InsufficientBalanceError } from "./errors";

export const CONTRACT_ID = "DEPLOYED_CONTRACT_ID";
const NETWORK_PASSPHRASE = Networks.TESTNET;

const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
const sorobanServer = new rpc.Server("https://soroban-testnet.stellar.org");
const READ_ONLY_KEY = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

export const fetchBalance = async (publicKey) => {
  const account = await horizonServer.loadAccount(publicKey);
  const xlm = account.balances.find((b) => b.asset_type === "native");
  return xlm ? parseFloat(xlm.balance).toFixed(2) : "0.00";
};

export const sendXLM = async (senderPublicKey, destination, amount, signTransaction) => {
  const balance = await fetchBalance(senderPublicKey);
  if (parseFloat(balance) < parseFloat(amount) + 0.1) {
    throw new InsufficientBalanceError();
  }

  const account = await horizonServer.loadAccount(senderPublicKey);
  const tx = new TransactionBuilder(account, {
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

  const signed = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (!signed) throw new Error("rejected");

  const result = await horizonServer.submitTransaction(
    TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE)
  );
  return result.hash;
};

export const pollTransaction = async (hash) => {
  for (let i = 0; i < 20; i++) {
    const response = await sorobanServer.getTransaction(hash);
    if (response.status === rpc.Api.GetTransactionStatus.SUCCESS) return hash;
    if (response.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain.");
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Transaction timed out.");
};

export const incrementCounter = async (publicKey, signTransaction) => {
  const account = await sorobanServer.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("increment"))
    .setTimeout(30)
    .build();

  const prepared = await sorobanServer.prepareTransaction(tx);
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (!signed) throw new Error("rejected");

  const result = await sorobanServer.sendTransaction(
    TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE)
  );
  return await pollTransaction(result.hash);
};

export const getCount = async () => {
  const contract = new Contract(CONTRACT_ID);
  const account = await sorobanServer.getAccount(READ_ONLY_KEY);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_count"))
    .setTimeout(30)
    .build();

  const result = await sorobanServer.simulateTransaction(tx);
  return scValToNative(result.result.retval);
};

export const setMessage = async (publicKey, message, signTransaction) => {
  const account = await sorobanServer.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("set_message", nativeToScVal(message, { type: "string" }))
    )
    .setTimeout(30)
    .build();

  const prepared = await sorobanServer.prepareTransaction(tx);
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (!signed) throw new Error("rejected");

  const result = await sorobanServer.sendTransaction(
    TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE)
  );
  return await pollTransaction(result.hash);
};

export const getMessage = async () => {
  const contract = new Contract(CONTRACT_ID);
  const account = await sorobanServer.getAccount(READ_ONLY_KEY);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_message"))
    .setTimeout(30)
    .build();

  const result = await sorobanServer.simulateTransaction(tx);
  return scValToNative(result.result.retval);
};
