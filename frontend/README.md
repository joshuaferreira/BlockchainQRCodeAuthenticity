Project Directory Structure

contracts/ - Smart contract ABIs and configuration
components/ - All React components organized by role:

consumer/ - Verification interface
manufacturer/ - Product registration & dashboard
retailer/ - Sale recording
admin/ - User authorization
shared/ - Reusable components


hooks/ - Custom React hooks for:

Contract interactions
Wallet connection
Geolocation
Analytics


services/ - API service layer (backend calls)
utils/ - Helper functions
constants/ - App constants and enums

packages used - 
"dependencies": {
    "axios": "^1.12.2", api calls
    "ethers": "^6.15.0", web3 connections
    "html5-qrcode": "^2.3.8", qr code scanning
    "lucide-react": "^0.546.0", icons/pngs
    "qrcode.react": "^4.2.0", generating qr codes
    "react": "^19.1.1", 
    "react-dom": "^19.1.1"
  },

blockchain-qr-frontend/
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   │
│   ├── contracts/                      # Smart contract ABIs and config
│   │   ├── ProductVerifier.json        # Contract ABI (copied from Truffle)
│   │   └── contractConfig.js           # Contract address and network config
│   │
│   ├── components/                     # React components
│   │   ├── consumer/                   # Consumer-facing components
│   │   │   ├── ConsumerVerification.js # Main verification interface
│   │   │   ├── QRScanner.js            # QR code scanner component
│   │   │   └── VerificationResult.js   # Display verification results
│   │   │
│   │   ├── manufacturer/              # Manufacturer components
│   │   │   ├── ProductRegistration.js # Register new products
│   │   │   ├── ProductList.js         # List all products
│   │   │   ├── ManufacturerDashboard.js # Main fraud detection dashboard
│   │   │   ├── AnalyticsCards.js      # Statistics cards
│   │   │   ├── SuspiciousLocations.js # Map of suspicious locations
│   │   │   └── DuplicateProducts.js   # List of copied QR codes
│   │   │
│   │   ├── retailer/                  # Retailer components
│   │   │   ├── SaleRecording.js       # Record product sales
│   │   │   └── RetailerDashboard.js   # Retailer's view
│   │   │
│   │   ├── admin/                     # Admin components
│   │   │   ├── AuthorizationManager.js # Authorize users
│   │   │   └── AdminDashboard.js      # Admin overview
│   │   │
│   │   └── shared/                    # Shared/Common components
│   │       ├── WalletConnect.js       # MetaMask connection
│   │       ├── Header.js              # App header/navbar
│   │       ├── Footer.js              # App footer
│   │       ├── Loader.js              # Loading spinner
│   │       ├── ErrorMessage.js        # Error display
│   │       ├── SuccessMessage.js      # Success notifications
│   │       ├── QRCodeGenerator.js 
│   │       └── QRScanner.js 
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useContract.js             # Main contract interaction hook
│   │   ├── useWallet.js               # Wallet connection hook
│   │   ├── useGeolocation.js          # Get user location
│   │   └── useAnalytics.js            # Fetch analytics data
│   │
│   ├── utils/                         # Utility functions
│   │   ├── blockchain.js              # Blockchain helper functions
│   │   ├── api.js                     # API calls to backend
│   │   ├── qrcode.js                  # QR code generation
│   │   ├── formatters.js              # Format addresses, dates, etc.
│   │   └── validators.js              # Form validation
│   │
│   ├── services/                      # API service layer
│   │   ├── scanService.js             # Scan logging API calls
│   │   ├── analyticsService.js        # Analytics API calls
│   │   └── productService.js          # Product-related API calls
│   │
│   ├── context/                       # React Context for state management
│   │   ├── WalletContext.js           # Wallet state
│   │   ├── ContractContext.js         # Contract instance state
│   │   └── UserContext.js             # User role and permissions
│   │
│   ├── styles/                        # CSS files
│   │   ├── App.css                    # Main app styles
│   │   ├── components.css             # Component-specific styles
│   │   └── tailwind.css               # Tailwind CSS (if using)
│   │
│   ├── assets/                        # Static assets
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   └── placeholder-qr.png
│   │   └── icons/
│   │       └── wallet-icon.svg
│   │
│   ├── constants/                     # Constants and enums
│   │   ├── roles.js                   # User roles
│   │   ├── scanResults.js             # Scan result types
│   │   └── routes.js                  # Route paths
│   │
│   ├── App.js                         # Main App component
│   ├── App.css                        # App styles
│   ├── index.js                       # Entry point
│   └── index.css                      # Global styles
│
├── .env                               # Environment variables
├── .env.example                       # Example env file
├── .gitignore                         # Git ignore file
├── package.json                       # Dependencies
├── package-lock.json                  # Lock file
└── README.md                          # Project documentation