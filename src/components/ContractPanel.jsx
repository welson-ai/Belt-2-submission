import { useState, useEffect } from "react";
import {
  incrementCounter,
  getCount,
  setMessage,
  getMessage,
} from "../utils/stellar";
import { parseError } from "../utils/errors";

const STATUS = { IDLE: "idle", PENDING: "pending", SUCCESS: "success", ERROR: "error" };

const ContractPanel = ({ publicKey, signTransaction }) => {
  const [count, setCount] = useState(null);
  const [message, setMsg] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      const [c, m] = await Promise.all([getCount(), getMessage()]);
      setCount(c);
      setMsg(m);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleIncrement = async () => {
    setStatus(STATUS.PENDING);
    setErrorMsg("");
    try {
      const hash = await incrementCounter(publicKey, signTransaction);
      setTxHash(hash);
      setStatus(STATUS.SUCCESS);
      await loadData();
    } catch (e) {
      const parsed = parseError(e);
      setErrorMsg(parsed.message);
      setStatus(STATUS.ERROR);
    }
  };

  const handleSetMessage = async () => {
    if (!newMessage.trim()) return;
    setStatus(STATUS.PENDING);
    setErrorMsg("");
    try {
      const hash = await setMessage(publicKey, newMessage, signTransaction);
      setTxHash(hash);
      setStatus(STATUS.SUCCESS);
      await loadData();
      setNewMessage("");
    } catch (e) {
      const parsed = parseError(e);
      setErrorMsg(parsed.message);
      setStatus(STATUS.ERROR);
    }
  };

  return (
    <div className="contract-panel">
      <h3>Smart Contract</h3>

      {/* Transaction Status Banner */}
      {status === STATUS.PENDING && (
        <div className="status pending">Transaction pending...</div>
      )}
      {status === STATUS.SUCCESS && (
        <div className="status success">
          Success!{" "}
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View tx
          </a>
        </div>
      )}
      {status === STATUS.ERROR && (
        <div className="status error">{errorMsg}</div>
      )}

      {/* Counter */}
      <div className="contract-row">
        <span>Counter: <strong>{count ?? "..."}</strong></span>
        <button
          className="btn send"
          onClick={handleIncrement}
          disabled={status === STATUS.PENDING}
        >
          Increment
        </button>
      </div>

      {/* Message */}
      <div className="contract-row column">
        <span>Message: <strong>{message || "..."}</strong></span>
        <input
          placeholder="Set a new message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="btn connect"
          onClick={handleSetMessage}
          disabled={status === STATUS.PENDING}
        >
          Set Message
        </button>
      </div>
    </div>
  );
};

export default ContractPanel;
