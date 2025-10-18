import React, { useState } from 'react';
// Hook to interact with smart contract actions (createProduct, etc.)
import { useContract } from '../../hooks/useContract';
// Shared UI components
import QRCodeGenerator from '../shared/QRCodeGenerator';
import ErrorMessage from '../shared/ErrorMessage';
import SuccessMessage from '../shared/SuccessMessage';
import Loader from '../shared/Loader';
// Icons used in the form and success screen
import { Package, Plus } from 'lucide-react';

const ProductRegistration = () => {
  // createProduct: function to register product on-chain
  // loading: boolean indicating if a createProduct tx is in progress
  const { createProduct, loading } = useContract();

  // Controlled form state for product registration fields
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    batchNumber: '',
    category: '',
    description: ''
  });

  // After successful registration this holds the registered product details
  const [registeredProduct, setRegisteredProduct] = useState(null);

  // UI message state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-defined categories shown in the category <select>
  const categories = [
    'Electronics',
    'Pharmaceuticals',
    'Fashion & Apparel',
    'Food & Beverages',
    'Cosmetics',
    'Automotive Parts',
    'Luxury Goods',
    'Other'
  ];

  // Update controlled form values and clear any existing error message
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Generates a semi-readable product ID when the user doesn't supply one.
  // Format: <CAT>-<last6timestamp>-<3digitRandom>
  const generateProductId = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase() || 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  // Handle form submission: validate inputs, call createProduct and handle UI state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic client-side validation. Keep messages user-friendly.
    if (!formData.productName.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.batchNumber.trim()) {
      setError('Batch number is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }

    try {
      // Use provided productId or auto-generate one
      const productId = formData.productId || generateProductId();
      
      // createProduct interacts with the contract. It may trigger a wallet
      // prompt and a transaction — `loading` reflects this state from the hook.
      await createProduct(
        productId,
        formData.batchNumber,
        formData.category,
        formData.description
      );

      // On success, show message and store registered product data for QR generation
      setSuccess(`Product ${productId} registered successfully!`);
      setRegisteredProduct({
        ...formData,
        productId
      });

      // Reset form for the next registration
      setFormData({
        productId: '',
        productName: '',
        batchNumber: '',
        category: '',
        description: ''
      });
    } catch (err) {
      // Show a simple error message; the hook may return an Error object
      setError(err.message || 'Failed to register product');
    }
  };

  // Reset state to register another product
  const handleRegisterAnother = () => {
    setRegisteredProduct(null);
    setSuccess('');
  };

  if (registeredProduct) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '40px'
        }}>
          {/* Success message with optional close */}
          <SuccessMessage 
            message={success}
            onClose={() => setSuccess('')}
          />

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '28px',
              color: '#1F2937'
            }}>
              Product Registered Successfully!
            </h2>
            <p style={{ margin: 0, color: '#6B7280' }}>
              QR code generated and ready to download
            </p>
          </div>

          {/* Product Details: shows key info for the registered product */}
          <div style={{
            background: '#F9FAFB',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0',
              fontSize: '18px',
              color: '#374151'
            }}>
              Product Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ color: '#6B7280' }}>Product ID:</span>
                <p style={{ 
                  margin: '4px 0 0 0',
                  fontWeight: '600',
                  color: '#4F46E5',
                  fontFamily: 'monospace'
                }}>
                  {registeredProduct.productId}
                </p>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Product Name:</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
                  {registeredProduct.productName}
                </p>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Batch Number:</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
                  {registeredProduct.batchNumber}
                </p>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>Category:</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
                  {registeredProduct.category}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code generator: produces downloadable QR code that encodes the product ID */}
          <QRCodeGenerator 
            productId={registeredProduct.productId}
            size={300}
          />

          {/* Action: register another product (resets the registeredProduct state) */}
          <button
            onClick={handleRegisterAnother}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '14px',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Plus size={20} />
            Register Another Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '40px'
      }}>
  {/* Header for registration form */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Package size={40} style={{ color: 'white' }} />
          </div>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '28px',
            color: '#1F2937'
          }}>
            Register New Product
          </h2>
          <p style={{ margin: 0, color: '#6B7280' }}>
            Add product to blockchain and generate QR code
          </p>
        </div>

        {/* Error and loading states */}
        <ErrorMessage message={error} onClose={() => setError('')} />

        {/* Show loader when createProduct transaction is in progress */}
        {loading && <Loader message="Registering product on blockchain..." />}

        {/* Registration form: only show when not loading */}
        {!loading && (
          <div>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="e.g., iPhone 15 Pro"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Product ID (Auto-generated if empty)
                </label>
                <input
                  type="text"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  placeholder="Leave empty for auto-generation"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Batch Number *
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  placeholder="e.g., BATCH-2024-Q4-001"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Product Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed product description..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Submit button triggers handleSubmit which validates and calls createProduct */}
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '14px',
                background: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Package size={20} />
              Register Product on Blockchain
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRegistration;