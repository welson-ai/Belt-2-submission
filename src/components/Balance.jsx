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
      .catch(() => setBalance("Error fetching"))
      .finally(() => setLoading(false));
  }, [publicKey]);

  return (
    <div className="balance-section">
      <h3>XLM Balance</h3>
      {loading ? <p>Loading...</p> : <p className="balance">{balance} XLM</p>}
    </div>
  );
};

export default Balance;
