const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// POST /api/products - Create a new product
router.post('/', productController.createProduct);

// GET /api/products/manufacturer/:address - Get products by manufacturer address
router.get('/manufacturer/:address', productController.getByManufacturer);

module.exports = router;
