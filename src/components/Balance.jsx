import { useEffect, useState } from "react";
import { fetchBalance } from "../utils/stellar";

const Balance = ({ publicKey }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    fetchBalance(publicKey)
      .then(setBalance)
      .catch(() => setBalance("Error"))
      .finally(() => setLoading(false));
  }, [publicKey]);

  return (
    <div className="card">
      <h2>💰 BELT-2 XLM Balance</h2>
      {loading ? <p>Loading balance...</p> : <p className="balance-amount">{balance} XLM</p>}
    </div>
  );
};

export default Balance;
