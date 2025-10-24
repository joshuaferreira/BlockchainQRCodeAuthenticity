// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title ProductVerifier
/// @notice Simple product registration & verification for manufacturers and retailers
/// @dev Stores product metadata and a single sale record per product. Uses simple access control maps.
contract ProductVerifier {
    
    /// @notice Product lifecycle status
    enum ProductStatus { Available, Sold }
    
    /// @notice Product information stored on-chain
    /// @dev `exists` is used to distinguish default struct values from real entries
    struct Product {
        string productId;       // External product identifier (e.g., SKU or serial)
        address manufacturer;   // Address of the manufacturer who registered this product
        uint256 manufactureDate;// Timestamp when the product was registered
        string batchNumber;     // Batch number for traceability
        string category;        // Product category or type
        bytes32 productHash;    // Hash of product details (off-chain data fingerprint)
        ProductStatus status;   // Current status (Available/Sold)
        bool exists;            // Flag to indicate record presence
    }
    
    /// @notice Record of a single sale for a product
    struct SaleRecord {
        string productId;       // Product identifier
        address retailer;       // Retailer address that recorded the sale
        address buyer;          // Optional: buyer's address
        uint256 saleDate;       // Timestamp of the sale
        string location;        // Store/location identifier
        bool exists;            // Flag to indicate sale record presence
    }
    
    // Storage mappings
    mapping(string => Product) public products;       // productId => Product
    mapping(string => SaleRecord) public sales;       // productId => SaleRecord (one sale per product)
    mapping(address => bool) public authorizedManufacturers; // Addresses allowed to create products
    mapping(address => bool) public authorizedRetailers;     // Addresses allowed to mark products sold
    
    address public owner; // Contract owner (deployer)
    
    // Events emitted for off-chain indexers or UIs
    event ProductCreated(string indexed productId, address indexed manufacturer);
    event ProductSold(string indexed productId, address indexed retailer, uint256 saleDate);
    event ProductStatusChanged(string indexed productId, ProductStatus newStatus);
    
    /// @dev Restrict to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /// @dev Restrict to authorized manufacturers
    modifier onlyManufacturer() {
        require(authorizedManufacturers[msg.sender], "Not authorized manufacturer");
        _;
    }
    
    /// @dev Restrict to authorized retailers
    modifier onlyRetailer() {
        require(authorizedRetailers[msg.sender], "Not authorized retailer");
        _;
    }
    
    /// @notice Deploy contract and make deployer the owner + initial manufacturer
    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true; // convenience: deployer can register initial products
    }
    
    /// @notice Grant manufacturer permissions to an address
    /// @param _manufacturer Address to authorize as manufacturer
    function authorizeManufacturer(address _manufacturer) public onlyOwner {
        // Prevent accidental authorization of the zero address which is almost always a bug
        require(_manufacturer != address(0), "manufacturer == zero");
        authorizedManufacturers[_manufacturer] = true;
    }
    
    /// @notice Grant retailer permissions to an address
    /// @param _retailer Address to authorize as retailer
    function authorizeRetailer(address _retailer) public onlyOwner {
        // Prevent accidental authorization of the zero address
        require(_retailer != address(0), "retailer == zero");
        authorizedRetailers[_retailer] = true;
    }

    /// @dev Internal helper: require a non-empty string. `err` should be a short revert message.
    function _nonEmptyString(string memory s, string memory err) internal pure {
        require(bytes(s).length > 0, err);
    }
    
    /// @notice Register a new product
    /// @dev Computes and stores a hash of `_productDetails` for off-chain verification
    /// @param _productId External product identifier (must be unique)
    /// @param _batchNumber Batch number string
    /// @param _category Category or type of product
    /// @param _productDetails Free-form details used to compute `productHash`
    function createProduct(
        string memory _productId,
        string memory _batchNumber,
        string memory _category,
        string memory _productDetails
    ) public onlyManufacturer {
        // Basic input validation to prevent empty/meaningless fields
        _nonEmptyString(_productId, "productId required");
        _nonEmptyString(_batchNumber, "batchNumber required");
        _nonEmptyString(_category, "category required");
        _nonEmptyString(_productDetails, "productDetails required");

        // Ensure we don't overwrite an existing product
        require(!products[_productId].exists, "Product already exists");
        
        // Hash product details so consumers can verify off-chain data matches on-chain fingerprint
        bytes32 productHash = keccak256(abi.encodePacked(_productDetails));
        
        products[_productId] = Product({
            productId: _productId,
            manufacturer: msg.sender,
            manufactureDate: block.timestamp,
            batchNumber: _batchNumber,
            category: _category,
            productHash: productHash,
            status: ProductStatus.Available,
            exists: true
        });
        
        emit ProductCreated(_productId, msg.sender);
    }
    
    // Mark product as sold (retailer calls this)
    /// @notice Record a sale and mark the product as Sold
    /// @param _productId Product identifier to mark sold
    /// @param _buyer Buyer's address (optional, may be zero address)
    /// @param _storeLocation Store/location identifier where sale occurred
    function markAsSold(
        string memory _productId,
        address _buyer,
        string memory _storeLocation
    ) public onlyRetailer {
        // Validate inputs
        _nonEmptyString(_productId, "productId required");
        _nonEmptyString(_storeLocation, "storeLocation required");

        // Ensure product exists and is available for sale
        require(products[_productId].exists, "Product does not exist");
        require(products[_productId].status == ProductStatus.Available, "Product already sold");
        
        // Update product status and store sale record
        products[_productId].status = ProductStatus.Sold;
        
        sales[_productId] = SaleRecord({
            productId: _productId,
            retailer: msg.sender,
            buyer: _buyer,
            saleDate: block.timestamp,
            location: _storeLocation,
            exists: true
        });
        
        emit ProductSold(_productId, msg.sender, block.timestamp);
        emit ProductStatusChanged(_productId, ProductStatus.Sold);
    }
    
    /// @notice Quick verification for consumers: existence, status, manufacturer and batch
    /// @param _productId Product identifier to query
    /// @return exists Whether the product exists in storage
    /// @return status Current ProductStatus
    /// @return manufacturer Address of the manufacturer
    /// @return batchNumber Batch number string
    function quickVerify(string memory _productId) 
        public 
        view 
        returns (
            bool exists,
            ProductStatus status,
            address manufacturer,
            string memory batchNumber
        ) 
    {
        Product memory product = products[_productId];
        return (
            product.exists,
            product.status,
            product.manufacturer,
            product.batchNumber
        );
    }
    
    /// @notice Retrieve detailed product information
    /// @param _productId Product identifier to query
    /// @return exists Whether the product exists
    /// @return manufacturer Manufacturer's address
    /// @return manufactureDate Timestamp when product was registered
    /// @return batchNumber Batch number string
    /// @return category Product category
    /// @return status Current ProductStatus
    function getProductDetails(string memory _productId)
        public
        view
        returns (
            bool exists,
            address manufacturer,
            uint256 manufactureDate,
            string memory batchNumber,
            string memory category,
            ProductStatus status
        )
    {
        Product memory product = products[_productId];
        return (
            product.exists,
            product.manufacturer,
            product.manufactureDate,
            product.batchNumber,
            product.category,
            product.status
        );
    }
    
    /// @notice Get sale information for a product (if sold)
    /// @param _productId Product identifier to query
    /// @return wasSold True if a sale record exists for this product
    /// @return retailer Retailer address that recorded the sale
    /// @return saleDate Timestamp of the sale
    /// @return location Store/location string
    function getSaleInfo(string memory _productId)
        public
        view
        returns (
            bool wasSold,
            address retailer,
            uint256 saleDate,
            string memory location
        )
    {
        SaleRecord memory sale = sales[_productId];
        return (
            sale.exists,
            sale.retailer,
            sale.saleDate,
            sale.location
        );
    }
}
