import { useState, useEffect } from "react";
import { incrementCounter, getCount, setMessage, getMessage } from "../utils/stellar";
import { parseError } from "../utils/errors";

const STATUS = { IDLE: "idle", PENDING: "pending", SUCCESS: "success", ERROR: "error" };

const ContractPanel = ({ publicKey, signTransaction }) => {
  const [count, setCount] = useState(null);
  const [message, setMsg] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      const [c, m] = await Promise.all([getCount(), getMessage()]);
      setCount(c);
      setMsg(m);
    } catch (e) {
      console.error("BELT-2 Load error:", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const run = async (fn) => {
    setStatus(STATUS.PENDING);
    setErrorMsg("");
    setTxHash("");
    try {
      const hash = await fn();
      setTxHash(hash);
      setStatus(STATUS.SUCCESS);
      await loadData();
    } catch (e) {
      setErrorMsg(parseError(e).message);
      setStatus(STATUS.ERROR);
    }
  };

  return (
    <div className="card">
      <h2>📜 BELT-2 Smart Contract</h2>

      {status === STATUS.PENDING && <div className="status pending">⏳ BELT-2 transaction pending...</div>}
      {status === STATUS.SUCCESS && (
        <div className="status success">
          ✅ BELT-2 Success!{" "}
          <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer">
            View tx ↗
          </a>
        </div>
      )}
      {status === STATUS.ERROR && <div className="status error">❌ BELT-2 Error: {errorMsg}</div>}

      <div className="contract-row">
        <span>🔢 BELT-2 Counter: <strong>{count ?? "..."}</strong></span>
        <button className="btn primary" onClick={() => run(() => incrementCounter(publicKey, signTransaction))} disabled={status === STATUS.PENDING}>
          Increment BELT-2
        </button>
      </div>

      <div className="contract-col">
        <span>💬 BELT-2 Message: <strong>{message || "..."}</strong></span>
        <input placeholder="New BELT-2 message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <button className="btn success" onClick={() => run(() => setMessage(publicKey, newMessage, signTransaction))} disabled={status === STATUS.PENDING || !newMessage.trim()}>
          Set BELT-2 Message
        </button>
      </div>
    </div>
  );
};

export default ContractPanel;
