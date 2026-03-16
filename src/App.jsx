import "./App.css";

function App() {
  return (
    <div className="signup-container">
      <div className="signup-form">
        <h1 className="form-title">Create Your Stellar Account</h1>
        
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Username</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Choose a username"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            placeholder="Create a password"
          />
        </div>
        
        <button className="generate-button">
          Generate New Stellar Account
        </button>
        
        <div className="connect-wallet-text">
          Connect Wallet
        </div>
      </div>
    </div>
  );
}

export default App;
