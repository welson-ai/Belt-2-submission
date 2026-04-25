export class WalletNotFoundError extends Error {
  constructor() {
    super("Wallet extension not detected. Please install a supported wallet.");
    this.type = "WALLET_NOT_FOUND";
  }
}

export class UserRejectedError extends Error {
  constructor() {
    super("You rejected the transaction request.");
    this.type = "USER_REJECTED";
  }
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super("Insufficient XLM balance to complete this transaction.");
    this.type = "INSUFFICIENT_BALANCE";
  }
}

export const parseError = (e) => {
  const msg = (e?.message || JSON.stringify(e) || "").toLowerCase();

  if (msg.includes("not found") || msg.includes("not installed") || msg.includes("undefined"))
    return new WalletNotFoundError();

  if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied"))
    return new UserRejectedError();

  if (msg.includes("balance") || msg.includes("insufficient") || msg.includes("underfunded"))
    return new InsufficientBalanceError();

  return e;
};
