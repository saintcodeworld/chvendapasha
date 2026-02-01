# ⚡ Pengu Runner

**Pengu Runner** is a high-performance, browser-based mining application that leverages WebAssembly (WASM) to mine Monero (XMR) while providing users with instant, automated payouts in Solana (SOL). 

By bridging the privacy-centric work of Monero with the high-speed liquidity of Solana, Pengu Runner offers a seamless "work-to-wallet" pipeline for decentralized enthusiasts.

---

## 🚀 Key Features

### 1. Dual-Protocol Mining
*   **Tab Mining (Passive)**: A background yield engine that accumulates SOL while the tab remains open. Ideal for users who want to earn while they browse.
*   **Captcha Mining (Active)**: Also known as the **Proof-of-Human Protocol**. Users solve encrypted captcha challenges to broadcast high-value shares. This mode yields significantly higher rewards than passive mining.
*   **Dual Core Sync**: Activating both modes simultaneously triggers "Dual Core Sync," optimizing the hashing algorithm for maximum performance and visual feedback.

### 2. Proof-of-Human Difficulty Levels
Active mining rewards are scaled based on complexity:
- **Easy**: 0.002 SOL per solve (4-character strings).
- **Medium**: 0.005 SOL per solve (6-character strings).
- **Hard**: 0.012 SOL per solve (9-character strings with high noise/distortion).

### 3. Automated Treasury Extraction
The platform is linked to the **Pengu Runner Automated Treasury**. 
- **Threshold**: Extraction becomes available once the balance hits **0.15 SOL**.
- **Instant Payouts**: Withdrawals are processed immediately via the treasury, bypassing manual approval and broadcasting directly to the blockchain.
- **Archive**: A full history of Transaction Hashes is maintained in the Transaction Archive.

### 4. Battery-Aware Throttling
The system utilizes the browser's **Battery Status API** to monitor device health. If the device unplugged and drops below 20%, the miner automatically throttles performance to preserve hardware longevity.

### 5. Offline Reward Accumulation
The **Signal Extractor** continues to track background time even when the tab is closed. Upon returning, a "Welcome Back" modal allows users to claim rewards harvested during their absence.

---

## 🛠 Technical Architecture

-   **Frontend**: React 19 with TypeScript.
-   **Styling**: Tailwind CSS for a high-contrast, cyberpunk-inspired UI.
-   **Data Visualization**: Recharts for real-time hashrate monitoring.
-   **State Management**: Custom `useMiner` hook orchestrating the interaction between hardware concurrency, local storage, and the treasury bridge.
-   **Security**: Protocol-level simulation of XMR-to-SOL bridging with unique transaction hash generation for every automated payout.

---

## 📊 Mining Specs

| Metric | Tab Mining | Captcha Mining (Hard) |
| :--- | :--- | :--- |
| **Yield Rate** | 0.000012 SOL / 1.5s | 0.012 SOL / Solve |
| **CPU Usage** | Low (Optimized) | Variable (Intensity-based) |
| **Interaction** | Zero-touch | Required (Human-Proof) |
| **Efficiency** | Stable | High-Burst |

---

## 🛡 Disclaimer
This application is a high-performance mining utility. Running the miner may increase CPU usage and power consumption. Ensure your device has adequate cooling. The "Monero Mining" is simulated via the browser's hardware concurrency to provide the user with a realistic bridging experience to the Solana Treasury.

---
*Built for the Decentralized Web.*