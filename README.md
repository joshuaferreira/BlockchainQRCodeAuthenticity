# 🧾 Blockchain-Based QR Code Product Verification System

## 📜 Overview

This project implements a **secure and transparent system** for verifying product authenticity using **blockchain technology and QR codes**.  
It addresses the global problem of product counterfeiting by allowing consumers to instantly check a product’s legitimacy against an immutable ledger, while providing manufacturers with analytical tools for fraud detection.

The system uses a **hybrid architecture** — combining the **trust and immutability of blockchain** (for core product data) with the **efficiency and scalability of an off-chain API and database** for analytics and scan logging.

![System Architecture Diagram](path/to/architecture-diagram.png)

---

## ✨ Features

### 👥 Consumer Verification
- Scan QR codes using a device camera.
- Upload QR code image files for verification.
- Manually enter Product IDs.
- Receive instant feedback:
  - ✅ **Authentic**
  - ❌ **Counterfeit**
  - ⚠️ **Already Sold**
- Scan events (anonymized, with optional location) logged for fraud analysis.

### 🏭 Manufacturer Tools
- Register new products on the blockchain.
- Generate unique QR codes linked to blockchain records.
- View a **Fraud Detection Dashboard** with:
  - Statistics on scan results.
  - Map visualization of suspicious scan locations.
  - Lists of products with potentially copied QR codes.

### 🏪 Retailer Functionality
- Record product sales on the blockchain, marking items as *Sold*.

### 🛠️ Admin Control
- Authorize manufacturer and retailer wallet addresses (role-based access).
- *(Future scope: Revoke authorizations.)*

---

## 🏗️ System Architecture

1. **Smart Contract (`ProductVerifier.sol`)**  
   - Single source of truth for product authenticity and ownership.  
   - Deployed on an Ethereum-compatible blockchain (e.g., Ganache).  
   - Handles product registration, sale records, and role management.

2. **Backend API (Node.js / Express / MongoDB)**  
   - Off-chain service for scan event logging and fraud analytics.  
   - Provides RESTful endpoints for the frontend dashboard.

3. **Frontend DApp (React / Vite / ethers.js)**  
   - User interface for Admin, Manufacturer, Retailer, and Consumer roles.  
   - Interacts with smart contract via `ethers.js` and backend API via `axios`.

---

## 💻 Technology Stack

| Layer | Technologies |
|-------|---------------|
| **Smart Contract** | Solidity `^0.8.19`, Truffle, Ganache |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), `dotenv`, `cors` |
| **Frontend** | React (Vite), `ethers.js` v6, `axios`, `html5-qrcode`, `qrcode.react`, `lucide-react` |
| **Wallet** | MetaMask |

---

## 📁 Project Structure

```bash
.
├── backend/                 # Node.js API and MongoDB Models
├── frontend/  # React Frontend DApp
└── truffle/          # Solidity Smart Contract (Truffle Project)
```


## 🚀 Setup and Installation

### 🧰 Prerequisites

* Node.js (v18+)
* Truffle (`npm install -g truffle`)
* Ganache (GUI or CLI)
* MetaMask (browser extension)
* MongoDB (local or cloud)

---

### 1️⃣ Smart Contract Deployment

```bash
# Navigate to the smart contract directory
cd smart-contract

# Install dependencies (if any)
npm install

# Ensure Ganache is running

# Compile the contracts
truffle compile

# Deploy contracts to Ganache
truffle migrate --network ganache
```

> **Note:**
> Copy `./build/contracts/ProductVerifier.json` →
> Paste it in `../blockchain-qr-frontend/src/contracts/ProductVerifier.json`
> Update contract address in `contractConfig.js`.

---

### 2️⃣ Backend API Setup

```bash
cd ../backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/product-verifier
PORT=5000
```

Run the backend:

```bash
npm run dev   # or npm start
```

Server runs on **[http://localhost:5000](http://localhost:5000)**

---

### 3️⃣ Frontend DApp Setup

```bash
cd ../blockchain-qr-frontend
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Update contract address in:

```js
src/contracts/contractConfig.js
```

Start the frontend:

```bash
npm run dev
```

App available at **[http://localhost:5173](http://localhost:5173)**

---

### 4️⃣ MetaMask Configuration

* Connect MetaMask to local Ganache:

  * **RPC URL:** `http://127.0.0.1:7545`
  * **Chain ID:** `1337`
* Import accounts from Ganache using private keys.

---

## 🕹️ Usage Guide

1. **Connect Wallet** — Open the frontend and click “Connect Wallet”.
2. **Admin**

   * Use the deploying account to authorize Manufacturer and Retailer addresses.
3. **Manufacturer**

   * Register new products on the blockchain.
   * Download generated QR codes.
   * Monitor analytics dashboard.
4. **Retailer**

   * Record product sales (mark as sold on-chain).
5. **Consumer**

   * Scan or upload product QR codes.
   * Verify authenticity instantly.

---

## 🔮 Future Enhancements

* 🔁 Admin revoke functions.
* 👥 `UserContext` for role-based UI access.
* ☁️ IPFS integration for decentralized storage.
* 🤖 Machine learning for fraud pattern detection.
* 🌐 Cross-chain interoperability.
* 💰 Tokenized incentives for users.

---

## 🧩 License

This project is open-source under the **MIT License**.

---

**Developed with 💡 Solidity · React · Node.js · MongoDB**

```
