const WalletConnect = ({ publicKey, connect, disconnect, error }) => (
  <div className="card">
    <h2>🔐 BELT-2 Wallet</h2>
    {!publicKey ? (
      <button className="btn primary" onClick={connect}>
        Connect BELT-2 Wallet
      </button>
    ) : (
      <div>
        <p className="address">
          ✅ BELT-2: {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
        </p>
        <button className="btn danger" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    )}
    {error && <p className="error-msg">⚠️ {error}</p>}
  </div>
);

export default WalletConnect;
