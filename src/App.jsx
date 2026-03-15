import WalletConnect from "./components/WalletConnect";
import Balance from "./components/Balance";
import SendPayment from "./components/SendPayment";
import ContractPanel from "./components/ContractPanel";
import { useWallet } from "./hooks/useWallet";
import "./App.css";

function App() {
  const { publicKey, connect, disconnect, signTransaction, error } = useWallet();

  return (
    <div className="app">
      <h1>Stellar Level 2 dApp</h1>
      <WalletConnect
        publicKey={publicKey}
        connect={connect}
        disconnect={disconnect}
        error={error}
      />
      {publicKey && (
        <>
          <Balance publicKey={publicKey} />
          <ContractPanel publicKey={publicKey} signTransaction={signTransaction} />
          <SendPayment publicKey={publicKey} signTransaction={signTransaction} />
        </>
      )}
    </div>
  );
}

export default App;
