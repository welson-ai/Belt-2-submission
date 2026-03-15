export class WalletNotFoundError extends Error {
  constructor() {
    super("Wallet not found. Please install a supported wallet extension.");
    this.type = "WALLET_NOT_FOUND";
  }
}

export class UserRejectedError extends Error {
  constructor() {
    super("Transaction rejected. You cancelled the request.");
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
  const msg = e?.message || JSON.stringify(e) || "";

  if (
    msg.toLowerCase().includes("not found") ||
    msg.toLowerCase().includes("not installed") ||
    msg.toLowerCase().includes("undefined")
  ) {
    return new WalletNotFoundError();
  }

  if (
    msg.toLowerCase().includes("reject") ||
    msg.toLowerCase().includes("cancel") ||
    msg.toLowerCase().includes("denied")
  ) {
    return new UserRejectedError();
  }

  if (
    msg.toLowerCase().includes("balance") ||
    msg.toLowerCase().includes("insufficient") ||
    msg.toLowerCase().includes("underfunded")
  ) {
    return new InsufficientBalanceError();
  }

  return e;
};
