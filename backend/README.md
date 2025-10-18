┌─────────────────────────────────────────────────────────────┐
│                    CONSUMER APP                             │
│  (Scans QR → Checks Blockchain → Logs to Database)          │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
        ┌─────────────────┐    ┌──────────────────┐
        │   BLOCKCHAIN    │    │  OFF-CHAIN DB    │
        │   (Truth)       │    │  (Analytics)     │
        │                 │    │                  │
        │ - Product IDs   │    │ - Scan logs      │
        │ - Status        │    │ - GPS coords     │
        │ - Ownership     │    │ - Timestamps     │
        └─────────────────┘    └──────────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │  MANUFACTURER DASHBOARD │
                            │  - Fraud Detection      │
                            │  - Location Heatmaps    │
                            │  - Suspicious Patterns  │
                            └─────────────────────────┘


backend/
├── models/
│   └── ScanLog.js
├── routes/
│   └── scans.js
├── controllers/
│   └── scanController.js
├── config/
│   └── db.js
├── .env
├── server.js
└── package.json


// Get contract instance
let contract = await ProductVerifier.deployed()

// Get accounts
let accounts = await web3.eth.getAccounts()

// Account 0 is already authorized manufacturer (owner)
// Authorize Account 1 as manufacturer
await contract.authorizeManufacturer(accounts[1], {from: accounts[0]})
console.log("✅ Account 1 authorized as manufacturer")

// Authorize Account 2 as retailer
await contract.authorizeRetailer(accounts[2], {from: accounts[0]})
console.log("✅ Account 2 authorized as retailer")

// Verify authorizations
let isMfr = await contract.authorizedManufacturers(accounts[1])
console.log("Account 1 is manufacturer:", isMfr)

let isRetailer = await contract.authorizedRetailers(accounts[2])
console.log("Account 2 is retailer:", isRetailer)

// Exit
.exit

# Account Roles

## Account 0 (Owner/Admin)
Address: 0x01C73E5a265356c7ebA718ed7a2395a7F03c6858
Role: Contract Owner + Manufacturer
Purpose: Deploy contract, authorize users, create products

## Account 1 (Manufacturer)
Address: 0xAE1A03F690F21fa3134bb40DF9CB276938f636ef
Role: Manufacturer
Purpose: Create products

## Account 2 (Retailer)
Address: 0x8055676051CBcf13D8fc3616ea6aD8c588Ce8592
Role: Retailer
Purpose: Record sales

## Account 3 (Consumer)
Address: 0xb431CdB004FceB881e0C84B64E6Aa7574977e9F8
Role: Consumer (no authorization needed)
Purpose: Verify products