import React, { useState } from 'react';
// Hook exposing contract admin functions and loading state
import { useContract } from '../../hooks/useContract';
import ErrorMessage from '../shared/ErrorMessage';
import SuccessMessage from '../shared/SuccessMessage';
import Loader from '../shared/Loader';
// Icons for UI affordances
import { Shield, UserPlus, Store as StoreIcon } from 'lucide-react';

const AdminDashboard = () => {
  // Contract functions to authorize roles
  const { authorizeManufacturer, authorizeRetailer, loading } = useContract();

  // Local controlled input state for addresses
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [retailerAddress, setRetailerAddress] = useState('');

  // UI feedback state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handler to authorize a manufacturer. Includes simple validation for
  // non-empty value and basic Ethereum address format check.
  const handleAuthorizeManufacturer = async () => {
    setError('');
    setSuccess('');

    if (!manufacturerAddress.trim()) {
      setError('Manufacturer address is required');
      return;
    }

    // Basic Ethereum address sanity check
    if (!manufacturerAddress.startsWith('0x') || manufacturerAddress.length !== 42) {
      setError('Invalid Ethereum address format');
      return;
    }

    try {
      await authorizeManufacturer(manufacturerAddress);
      setSuccess(`Manufacturer ${manufacturerAddress} authorized successfully!`);
      setManufacturerAddress('');
    } catch (err) {
      setError(err.message || 'Failed to authorize manufacturer');
    }
  };

  // Similar handler for retailers
  const handleAuthorizeRetailer = async () => {
    setError('');
    setSuccess('');

    if (!retailerAddress.trim()) {
      setError('Retailer address is required');
      return;
    }

    if (!retailerAddress.startsWith('0x') || retailerAddress.length !== 42) {
      setError('Invalid Ethereum address format');
      return;
    }

    try {
      await authorizeRetailer(retailerAddress);
      setSuccess(`Retailer ${retailerAddress} authorized successfully!`);
      setRetailerAddress('');
    } catch (err) {
      setError(err.message || 'Failed to authorize retailer');
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '40px'
      }}>
        {/* Header area */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Shield size={40} style={{ color: 'white' }} />
          </div>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '28px',
            color: '#1F2937'
          }}>
            Admin Dashboard
          </h2>
          <p style={{ margin: 0, color: '#6B7280' }}>
            Authorize manufacturers and retailers
          </p>
        </div>

        {/* Feedback components */}
        <ErrorMessage message={error} onClose={() => setError('')} />
        <SuccessMessage message={success} onClose={() => setSuccess('')} />

        {/* Loader when any authorization transaction is in progress */}
        {loading && <Loader message="Processing authorization..." />}

        {/* Main grid with two panels: one for authorizing manufacturers, one for retailers */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Authorize Manufacturer panel */}
            <div style={{
              padding: '30px',
              background: '#F9FAFB',
              borderRadius: '12px',
              border: '2px solid #E5E7EB'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <UserPlus size={24} style={{ color: '#4F46E5' }} />
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1F2937' }}>
                  Authorize Manufacturer
                </h3>
              </div>

              <p style={{ 
                margin: '0 0 15px 0', 
                fontSize: '14px', 
                color: '#6B7280' 
              }}>
                Grant permission to create and register products
              </p>

              <input
                type="text"
                value={manufacturerAddress}
                onChange={(e) => setManufacturerAddress(e.target.value)}
                placeholder="0x..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  marginBottom: '12px'
                }}
              />

              <button
                onClick={handleAuthorizeManufacturer}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <UserPlus size={18} />
                Authorize Manufacturer
              </button>
            </div>

            {/* Authorize Retailer panel */}
            <div style={{
              padding: '30px',
              background: '#F9FAFB',
              borderRadius: '12px',
              border: '2px solid #E5E7EB'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <StoreIcon size={24} style={{ color: '#10B981' }} />
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1F2937' }}>
                  Authorize Retailer
                </h3>
              </div>

              <p style={{ 
                margin: '0 0 15px 0', 
                fontSize: '14px', 
                color: '#6B7280' 
              }}>
                Grant permission to record product sales
              </p>

              <input
                type="text"
                value={retailerAddress}
                onChange={(e) => setRetailerAddress(e.target.value)}
                placeholder="0x..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  marginBottom: '12px'
                }}
              />

              <button
                onClick={handleAuthorizeRetailer}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <StoreIcon size={18} />
                Authorize Retailer
              </button>
            </div>
          </div>
        )}

        {/* Instructions / important notes for the admin user */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#FEF3C7',
          borderRadius: '8px',
          border: '2px solid #FCD34D'
        }}>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#92400E'
          }}>
            ⚠️ Important Notes:
          </p>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            fontSize: '13px',
            color: '#92400E'
          }}>
            <li>Only the contract owner can authorize users</li>
            <li>Authorized manufacturers can create products</li>
            <li>Authorized retailers can mark products as sold</li>
            <li>Addresses must be valid Ethereum addresses (0x...)</li>
            <li>Authorization is permanent and cannot be revoked (in current contract)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;