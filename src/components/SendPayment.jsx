import { useState } from "react";
import { sendXLM } from "../utils/stellar";

const SendPayment = ({ publicKey, signTransaction }) => {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!destination || !amount) return;
    setLoading(true);
    setStatus(null);
    setTxHash("");

    try {
      const hash = await sendXLM(publicKey, destination, amount, signTransaction);
      setTxHash(hash);
      setStatus("success");
    } catch (e) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-section">
      <h3>Send XLM</h3>
      <input
        placeholder="Destination Address"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        placeholder="Amount (XLM)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSend} disabled={loading} className="btn send">
        {loading ? "Sending..." : "Send XLM"}
      </button>

      {status === "success" && (
        <div className="feedback success">
          Transaction Successful!
          <br />
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer: {txHash.slice(0, 16)}...
          </a>
        </div>
      )}
      {status === "error" && (
        <div className="feedback error">Transaction Failed. Check the address and balance.</div>
      )}
    </div>
  );
};

export default SendPayment;
