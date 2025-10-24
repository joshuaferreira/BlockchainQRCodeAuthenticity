const Product = require('../models/Product');

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

// POST /api/products - Create/store a new product
exports.createProduct = async (req, res) => {
	try {
		const { uid, manufacturer, details } = req.body || {};

		if (!uid || !manufacturer || !details) {
			return res.status(400).json({
				success: false,
				message: 'uid, manufacturer and details are required'
			});
		}

		const mfg = String(manufacturer).trim();
		if (!addressRegex.test(mfg)) {
			return res.status(400).json({
				success: false,
				message: 'manufacturer must be a valid Ethereum address (0x...)'
			});
		}

		// Check for duplicate uid to return a friendly error
		const existing = await Product.findOne({ uid: String(uid).trim() });
		if (existing) {
			return res.status(409).json({
				success: false,
				message: 'A product with this uid already exists'
			});
		}

		const product = new Product({
			uid: String(uid).trim(),
			manufacturer: mfg.toLowerCase(),
			details: String(details).trim()
		});

		await product.save();

		return res.status(201).json({
			success: true,
			message: 'Product created successfully',
			data: product
		});
	} catch (error) {
		console.error('Error creating product:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to create product',
			error: error.message
		});
	}
};

// GET /api/products/manufacturer/:address - List products for a manufacturer
exports.getByManufacturer = async (req, res) => {
	try {
		const { address } = req.params;
		const { limit = 100 } = req.query;

		if (!addressRegex.test(address)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid manufacturer address'
			});
		}

		const max = Math.min(parseInt(limit) || 100, 1000);
		const products = await Product.find({ manufacturer: address.toLowerCase() })
			.sort({ createdAt: -1 })
			.limit(max);

		return res.json({
			success: true,
			count: products.length,
			data: products
		});
	} catch (error) {
		console.error('Error fetching products by manufacturer:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to fetch products',
			error: error.message
		});
	}
};

