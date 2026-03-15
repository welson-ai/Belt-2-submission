const WalletConnect = ({ publicKey, connect, disconnect, error }) => {
  return (
    <div className="wallet-section">
      {!publicKey ? (
        <button onClick={connect} className="btn connect">
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="address">
            {publicKey.slice(0, 6)}...{publicKey.slice(-6)}
          </p>
          <button onClick={disconnect} className="btn disconnect">
            Disconnect
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default WalletConnect;
