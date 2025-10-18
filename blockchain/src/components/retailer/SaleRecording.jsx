import React, { useState } from 'react';
// Hook to interact with on-chain actions (mark product as sold)
import { useContract } from '../../hooks/useContract';
import ErrorMessage from '../shared/ErrorMessage';
import SuccessMessage from '../shared/SuccessMessage';
import Loader from '../shared/Loader';
import { Store, CheckCircle } from 'lucide-react';

const SaleRecording = () => {
  // markAsSold: contract action; loading reflects transaction in-flight
  const { markAsSold, loading } = useContract();

  // Controlled form state for sale recording
  const [formData, setFormData] = useState({
    productId: '',
    buyerAddress: '',
    storeLocation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form fields and clear existing errors
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Handle submit: validate required fields, call markAsSold and update UI state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation: productId and storeLocation are required
    if (!formData.productId.trim()) {
      setError('Product ID is required');
      return;
    }

    if (!formData.storeLocation.trim()) {
      setError('Store location is required');
      return;
    }

    try {
      // If buyer address is not provided, use the zero address as a placeholder
      await markAsSold(
        formData.productId,
        formData.buyerAddress || '0x0000000000000000000000000000000000000000',
        formData.storeLocation
      );

      setSuccess(`Product ${formData.productId} marked as sold successfully!`);
      
      // Reset form after successful transaction
      setFormData({
        productId: '',
        buyerAddress: '',
        storeLocation: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to record sale');
    }
  };

  return (
    <div style={{
      maxWidth: '700px',
      margin: '40px auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '40px'
      }}>
        {/* Header: page title and subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Store size={40} style={{ color: 'white' }} />
          </div>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '28px',
            color: '#1F2937'
          }}>
            Record Product Sale
          </h2>
          <p style={{ margin: 0, color: '#6B7280' }}>
            Mark a product as sold on the blockchain
          </p>
        </div>

        {/* Feedback messages */}
        <ErrorMessage message={error} onClose={() => setError('')} />
        <SuccessMessage message={success} onClose={() => setSuccess('')} />

        {/* Show loader while transaction is being processed, otherwise show form */}
        {loading ? (
          <Loader message="Recording sale on blockchain..." />
        ) : (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Product ID *
              </label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                placeholder="e.g., PROD-001"
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Store Location *
              </label>
              <input
                type="text"
                name="storeLocation"
                value={formData.storeLocation}
                onChange={handleChange}
                placeholder="e.g., Store NYC-001 or Mumbai Store"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Buyer Address (Optional)
              </label>
              <input
                type="text"
                name="buyerAddress"
                value={formData.buyerAddress}
                onChange={handleChange}
                placeholder="0x... (optional)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
              <p style={{
                margin: '6px 0 0 0',
                fontSize: '12px',
                color: '#6B7280'
              }}>
                Leave empty if buyer address is unknown
              </p>
            </div>

            {/* Submit the sale recording transaction */}
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '14px',
                background: '#10B981',
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
              <CheckCircle size={20} />
              Record Sale
            </button>
          </div>
        )}

        {/* Info: static guidance about sale recording rules */}
        <div style={{
          marginTop: '30px',
          padding: '16px',
          background: '#EFF6FF',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1E40AF'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
            ℹ️ Important Information
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Product must exist in the blockchain</li>
            <li>Product must have status "Available"</li>
            <li>Once marked as sold, status cannot be changed back</li>
            <li>This transaction will be recorded permanently</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SaleRecording;