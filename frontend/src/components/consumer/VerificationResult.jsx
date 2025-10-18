import React from 'react';
// Icons for each result state
import { CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

// VerificationResult renders a styled summary of the verification outcome.
// Props:
// - result: object returned by verification call (contains scanResult, exists, status, manufacturer, batchNumber, etc.)
// - productId: the product identifier scanned or entered by the user
const VerificationResult = ({ result, productId }) => {
  // Map scan result types to visual configuration (icon, colors, title, description)
  const getResultConfig = () => {
    switch (result.scanResult) {
      case 'AUTHENTIC':
        return {
          icon: CheckCircle,
          color: '#059669',
          bgColor: '#D1FAE5',
          borderColor: '#34D399',
          title: '✅ AUTHENTIC PRODUCT',
          description: 'This product is genuine and registered on the blockchain.'
        };
      case 'NOT_FOUND':
        return {
          icon: AlertCircle,
          color: '#DC2626',
          bgColor: '#FEE2E2',
          borderColor: '#F87171',
          title: '⚠️ COUNTERFEIT DETECTED',
          description: 'This product is NOT registered. It is likely counterfeit.'
        };
      case 'ALREADY_SOLD':
        return {
          icon: ShieldAlert,
          color: '#D97706',
          bgColor: '#FEF3C7',
          borderColor: '#FCD34D',
          title: '⚠️ WARNING: Already Sold',
          description: 'This product has already been sold. This may be a counterfeit with a copied QR code.'
        };
      default:
        return null;
    }
  };

  // Get styling/config for the current result; if unknown, render nothing
  const config = getResultConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div style={{
      padding: '24px',
      background: config.bgColor,
      border: `3px solid ${config.borderColor}`,
      borderRadius: '12px'
    }}>
      {/* Icon and Title */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Icon size={56} style={{ color: config.color, marginBottom: '12px' }} />
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '22px',
          color: config.color,
          fontWeight: 'bold'
        }}>
          {config.title}
        </h3>
        <p style={{ 
          margin: 0, 
          color: config.color,
          fontSize: '14px'
        }}>
          {config.description}
        </p>
      </div>

      {/* Product Details: only show if the product record exists on-chain */}
      {result.exists && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '16px',
            color: '#374151'
          }}>
            Product Information
          </h4>
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
                color: '#1F2937',
                fontFamily: 'monospace'
              }}>
                {productId}
              </p>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Status:</span>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontWeight: '600',
                color: result.status === 0 ? '#059669' : '#D97706'
              }}>
                {result.status === 0 ? 'Available' : 'Sold'}
              </p>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Manufacturer:</span>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontWeight: '600',
                color: '#1F2937',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                {/* Show a shortened manufacturer address for readability */}
                {result.manufacturer.slice(0, 10)}...{result.manufacturer.slice(-8)}
              </p>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Batch Number:</span>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontWeight: '600',
                color: '#1F2937'
              }}>
                {result.batchNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Warnings: additional guidance when the scan detects problems */}
      {result.scanResult === 'ALREADY_SOLD' && (
        <div style={{
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          border: '2px solid #FCD34D'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px',
            color: '#92400E',
            fontWeight: '500'
          }}>
            <strong>⚠️ Action Required:</strong> If you purchased this product as new,
            it may be counterfeit. Please contact the manufacturer immediately and
            report the retailer.
          </p>
        </div>
      )}

      {result.scanResult === 'NOT_FOUND' && (
        <div style={{
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          border: '2px solid #F87171'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px',
            color: '#991B1B',
            fontWeight: '500'
          }}>
            <strong>🚨 Do Not Purchase:</strong> This product is not registered with
            the manufacturer. It is likely counterfeit. Please report this to the
            manufacturer and avoid purchasing.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationResult;