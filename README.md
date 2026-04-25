# Stellar BELT-2 dApp Submission

## Stellar Wallets Kit — Known Errors & Fixes

> Vite + React + `@creit.tech/stellar-wallets-kit`  
> Tracked during local dev on Stellar Testnet

---

### Error 1 — Wallet Kit `.on()` Initialization Error

```
TypeError: Cannot read properties of undefined (reading 'on')
at initKit (App.jsx:22:24)
at App.jsx:44:5
```

**Cause:** Kit was initialized using the old API inside `useEffect` with event listeners. The `.on()` method no longer exists in the current version.

**Fix:** Remove all `.on()` listeners. Initialize the kit at **module level** (outside the component) and use the `onWalletSelected` callback inside `openModal()` instead.

```js
// Correct initialization — outside the component
const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule()],
})

// Correct connect flow
kit.openModal({
  onWalletSelected: async (option) => {
    kit.setWallet(option.id)
    const { address } = await kit.getAddress()
    setAddress(address)
  }
})
```

---

### Error 2 — Unresolved Package Import Error

```
[plugin:vite:import-analysis] Failed to resolve import 
"@creit.tech/stellar-wallets-kit" from "src/App.jsx". 
Does the file exist?
```

**Cause:** Windsurf wrote the import statement but never ran the install command. The package doesn't exist in `node_modules`.

**Fix:** Install the package manually before running the dev server.

```bash
npm install @creit.tech/stellar-wallets-kit --legacy-peer-deps
```

> Use `--legacy-peer-deps` if you get peer dependency conflicts with your React version.

---

### Error 3 — Missing Named Export Error

```
Uncaught SyntaxError: The requested module 
'/node_modules/.vite/deps/@creit__tech_stellar-wallets-kit.js' 
does not provide an export named 'AlbedoModule'
```

**Cause:** The package version installed on your machine does not export `AlbedoModule` (or `xBullModule`). Windsurf pulled from outdated examples online and guessed the export names.

**Fix:** Check what your installed version actually exports before writing any imports.

```bash
node -e "console.log(Object.keys(require('./node_modules/@creit.tech/stellar-wallets-kit')))"
```

Then use **only** what is printed. Safe minimal import:

```js
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
} from '@creit.tech/stellar-wallets-kit'
```

> Start with `FreighterModule` only. Add other wallets after it works.

---

### Error 4 — Vite ESM Conditions Error

```
[plugin:builtin:vite-resolve] "./sdk/modules/utils" is not exported 
under the conditions ["module", "browser", "development", "import"] 
from package @creit.tech/stellar-wallets-kit
```

**Cause:** Vite's strict ESM resolver cannot resolve internal paths inside the package (`./sdk/modules/utils`). The package uses internal relative paths that don't match Vite's browser export conditions.

**Fix — Step 1:** Pin to a working version of the package.

```bash
npm remove @creit.tech/stellar-wallets-kit
npm install @creit.tech/stellar-wallets-kit@0.9.4 --legacy-peer-deps
```

**Fix — Step 2:** Update `vite.config.js` to exclude the package from pre-bundling.

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@creit.tech/stellar-wallets-kit'],
  },
  build: {
    commonjsOptions: {
      include: [/@creit.tech\/stellar-wallets-kit/, /node_modules/],
    },
  },
})
```

**Fix — Step 3:** Clear the Vite cache and restart.

```bash
rm -rf node_modules/.vite
npm run dev
```

> If issues persist, switch to **Next.js** and add `transpilePackages: ['@creit.tech/stellar-wallets-kit']` to `next.config.js`. Next.js handles mixed CJS/ESM packages significantly better than Vite.

---

### Error 5 — Freighter Page Provider Error

```
pageProvider.js:1 Error checking default wallet status: Object
k @ pageProvider.js:1
```

**Cause:** The Freighter browser extension runs its own status checks in `pageProvider.js` before the kit is fully initialized. This is fired by the extension itself, not your code.

**Fix:** This error is mostly harmless and comes from the Freighter extension. Suppress it by delaying kit initialization until after the page is fully mounted.

```js
const [kit, setKit] = useState(null)

useEffect(() => {
  // Small delay lets Freighter finish its own init first
  const timer = setTimeout(() => {
    try {
      const k = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: FREIGHTER_ID,
        modules: [new FreighterModule()],
      })
      setKit(k)
    } catch (e) {
      console.error('Kit init failed:', e.message)
    }
  }, 100)
  return () => clearTimeout(timer)
}, [])
```

---

### Error 6 — Vite Server Connection Lost

```
[vite] server connection lost. Polling for restart...
```

**Cause:** This is a cascading crash — not a root cause on its own. It appears whenever any of the above errors kills the Vite dev server process entirely.

**Fix:** Identify and fix the root error first (usually Error 3 or Error 4 above). Then:

```bash
# Hard restart
rm -rf node_modules/.vite
npm run dev
```

If it keeps happening, check if any import is causing a top-level crash outside of React's error boundary.

---

## How I Solved These Issues

1. **Dynamic Module Loading**: Used dynamic imports with `ensureInit()` function to handle module detection and initialization properly
2. **Comprehensive Error Handling**: Implemented robust error parsing with custom error classes for different failure scenarios
3. **Module Detection**: Added automatic detection of available wallet modules instead of hardcoding them
4. **Fallback Mechanisms**: Implemented fallback to `allowAllModules()` when specific module instantiation fails
5. **Initialization Timing**: Added proper initialization sequencing to avoid race conditions with wallet extensions
6. **Version Compatibility**: Ensured compatibility with the latest Stellar Wallets Kit v2.0.1 API changes

---

## Contract Address
CACC6ZI2U3BOUIBJURYBIT7PY4HXFINMFPJCUV6WDZEEP6QEJ7CJZFCY

## Application Screenshots

### Before Connect Wallet
![Before Connect Wallet](public/imagey.png)

### After Wallet Connection - Multiple Wallet Options
![Multiple Wallet Options](public/image.png)

---

# Stellar Soroban dApp - Level 2

A comprehensive decentralized application built on Stellar blockchain with multi-wallet support and smart contract integration.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  React 19.2.4 + Vite 8.0.0                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ WalletConnect│ │   Balance   │ │ SendPayment │ │ContractUI │ │
│  │   Component │ │  Component  │ │ Component  │ │ Component │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│         │               │               │               │       │
│         └───────────────┼───────────────┼───────────────┘       │
│                         │                                       │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              useWallet Hook                             │     │
│  │  ┌─────────────────────────────────────────────────────┐ │     │
│  │  │ StellarWalletsKit v2.0.1 (Multi-Wallet Support)    │ │     │
│  │  │ • Freighter • xBull • Albedo • Hana • Lobstr       │ │     │
│  │  │ • WalletConnect • Trezor • Ledger • Rabet          │ │     │
│  │  └─────────────────────────────────────────────────────┘ │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STELLAR NETWORK LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  Stellar SDK v13.3.0                                           │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │               Stellar RPC Interface                     │     │
│  │  • Account Balance Queries                              │     │
│  │  • Transaction Submission                               │     │
│  │  • Contract Invocation                                  │     │
│  │  • Transaction Simulation                              │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                │                               │
│                                ▼                               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              Soroban Smart Contract                      │     │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │     │
│  │  │   Counter   │ │   Message   │ │   Storage       │   │     │
│  │  │  Functions  │ │  Functions  │ │   Management    │   │     │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
belt2/
├── README.md                    # Project documentation
├── package.json                 # Dependencies & scripts
├── index.html                   # HTML entry point
├── src/                         # Source code
│   ├── main.jsx                 # React app entry
│   ├── App.jsx                  # Main application component
│   ├── App.css                  # Application styling
│   ├── index.css                # Global styles & reset
│   ├── hooks/                   # Custom React hooks
│   │   └── useWallet.js         # Wallet management hook
│   ├── components/               # React components
│   │   ├── WalletConnect.jsx    # Wallet connection UI
│   │   ├── Balance.jsx          # XLM balance display
│   │   ├── SendPayment.jsx      # Payment sending UI
│   │   └── ContractPanel.jsx    # Contract interaction UI
│   └── utils/                   # Utility functions
│       ├── stellar.js           # Stellar SDK integration
│       └── errors.js            # Error handling utilities
├── public/                      # Static assets
│   ├── favicon.ico              # App favicon
│   └── stellar-logo.png         # Stellar branding
├── contracts/                   # Smart contracts (empty)
└── stellar-contract/            # Soroban contract project
    ├── Cargo.toml               # Workspace configuration
    ├── README.md                # Contract documentation
    └── contracts/               # Contract source
        └── hello-world/         # Main contract
            ├── Cargo.toml       # Contract dependencies
            ├── Makefile          # Build utilities
            └── src/             # Contract source code
                ├── lib.rs        # Contract implementation
                └── test.rs       # Contract tests
```

## Features

### Multi-Wallet Support
- **Freighter** - Browser extension wallet
- **xBull** - Desktop/mobile wallet
- **Albedo** - Web-based wallet
- **Hana** - Mobile wallet
- **Lobstr** - Mobile wallet
- **WalletConnect** - Protocol support
- **Trezor** - Hardware wallet
- **Ledger** - Hardware wallet
- **Rabet** - Browser extension

### Wallet Functionality
- **Connect/Disconnect** wallets
- **View XLM balance** in real-time
- **Send XLM payments** to any address
- **Transaction signing** with proper error handling

### Smart Contract Integration
- **Counter Contract** - Increment/decrement functionality
- **Message Storage** - Set and retrieve string messages
- **Event Publishing** - Contract event emissions
- **State Management** - Persistent data storage

### User Interface
- **Dark Theme** - Modern dark mode design
- **Card-based Layout** - Clean component organization
- **Responsive Design** - Mobile-friendly interface
- **Real-time Updates** - Live transaction status
- **Error Handling** - User-friendly error messages

## Technology Stack

### Frontend
- **React 19.2.4** - UI framework
- **Vite 8.0.0** - Build tool and dev server
- **Stellar Wallets Kit v2.0.1** - Multi-wallet integration
- **Stellar SDK v13.3.0** - Stellar blockchain interaction

### Smart Contract
- **Rust** - Contract programming language
- **Soroban SDK v21.0.0** - Stellar smart contract framework
- **WASM** - WebAssembly compilation target

### Development Tools
- **Stellar CLI v25.1.0** - Command-line tools
- **Rust Toolchain** - Latest stable Rust
- **wasm32-unknown-unknown** - WASM compilation target

## Installation & Setup

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Contract Setup
```bash
# Navigate to contract directory
cd stellar-contract

# Build contract
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source deployer \
  --network testnet
```

## Configuration

### Network Configuration
- **Testnet Network** - Development and testing
- **RPC Endpoint** - `https://soroban-testnet.stellar.org`
- **Network Passphrase** - `Test SDF Network ; September 2015`

### Contract Configuration
- **Contract ID** - Set after deployment
- **Function Exports** - `increment`, `get_count`, `set_message`, `get_message`
- **Storage Keys** - `Counter`, `Message`

## Usage Instructions

### 1. Connect Wallet
1. Open application in browser
2. Click "Connect Wallet" button
3. Select preferred wallet from modal
4. Approve connection in wallet

### 2. View Balance
- Connected wallet's XLM balance displays automatically
- Updates in real-time after transactions

### 3. Send Payments
1. Enter recipient address
2. Enter amount in XLM
3. Click "Send Payment"
4. Confirm transaction in wallet

### 4. Contract Interaction
1. **Increment Counter** - Click "Increment" button
2. **Set Message** - Enter text and click "Set Message"
3. **Get Message** - Click "Get Message" to retrieve
4. **View Counter** - Current count displays automatically

## Testing

### Frontend Testing
```bash
# Run development server
npm run dev

# Open browser to http://localhost:5173
# Test wallet connection and contract interactions
```

### Contract Testing
```bash
# Navigate to contract directory
cd stellar-contract/contracts/hello-world

# Run contract tests
cargo test

# Build contract
stellar contract build
```

## Contract API Reference

### Functions

#### `increment() -> u32`
- **Purpose:** Increment counter by 1
- **Returns:** New counter value
- **Events:** Publishes "INC" event with new value

#### `get_count() -> u32`
- **Purpose:** Get current counter value
- **Returns:** Current counter value (0 if not set)

#### `set_message(message: String)`
- **Purpose:** Store a message string
- **Parameters:** `message` - String to store
- **Events:** Publishes "MSG" event with message

#### `get_message() -> String`
- **Purpose:** Retrieve stored message
- **Returns:** Stored message or default "Hello, Stellar!"

### Storage Structure
```
DataKey::Counter -> u32
DataKey::Message -> String
```

## Security Considerations

### Frontend Security
- **Input Validation** - All user inputs validated
- **Error Handling** - Comprehensive error catching
- **Secure Connections** - HTTPS only in production

### Contract Security
- **Access Control** - Public functions with proper validation
- **Overflow Protection** - Safe arithmetic operations
- **Event Logging** - All state changes emit events

### Wallet Security
- **Transaction Signing** - Never exposes private keys
- **User Confirmation** - All transactions require wallet approval
- **Network Isolation** - Testnet only for development

## Troubleshooting

### Common Issues

#### Wallet Connection Failed
- Check wallet is installed and unlocked
- Ensure browser supports wallet extensions
- Verify network is set to Testnet

#### Transaction Errors
- Check account has sufficient XLM balance
- Verify recipient address is valid
- Ensure network connectivity

#### Contract Deployment Failed
- Check deployer account is funded
- Verify contract WASM is built correctly
- Ensure network configuration is correct

### Debug Tools
- **Browser Console** - Check for JavaScript errors
- **Stellar Laboratory** - Advanced debugging tools
- **Network Explorer** - View transaction details

## Additional Resources

### Documentation
- [Stellar Developers](https://developers.stellar.org/)
- [Soroban Documentation](https://developers.stellar.org/docs/build/smart-contracts/)
- [Stellar Wallets Kit](https://github.com/creit-tech/stellar-wallets-kit)

### Tools
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert](https://stellar.expert/)
- [Stellar Quest](https://stellar.quest/)

### Community
- [Stellar Discord](https://discord.gg/stellar)
- [Stellar Reddit](https://reddit.com/r/Stellar)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/stellar)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## Support

For support and questions:
- Create an issue in the repository
- Join the Stellar Discord community
- Check the troubleshooting section above

---

**Built with love for the Stellar ecosystem**
