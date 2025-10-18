import React, { useState } from 'react';
// Hook that communicates with the smart contract layer for verification
import { useContract } from '../../hooks/useContract';
import QRCodeInput from '../shared/QRCodeInput'; // Use the new merged component 
import VerificationResult from './VerificationResult';
// Icons used in the UI
import { Search, Camera } from 'lucide-react';
import Loader from '../shared/Loader';

// ConsumerVerification provides a UI for end-users to verify product authenticity
// Users can either scan a QR code (preferred) or manually enter a product ID.
const ConsumerVerification = () => {
  // verifyAndLogProduct: function that triggers on-chain verification + logging
  // loading: boolean indicating whether a verification call is in progress
  const { verifyAndLogProduct, loading } = useContract();

  // UI state
  const [scanMode, setScanMode] = useState(true); // true = QR scan, false = manual entry
  const [productId, setProductId] = useState(''); // controlled input for manual mode
  const [result, setResult] = useState(null); // holds verification result to display

  // Called when QRScanner returns a scanned product ID. Delegates to the
  // contract hook to verify and persist a scan log. Errors are surfaced via
  // console + an alert for simplicity (consider a nicer UI notification).
  const handleScan = async (scannedProductId) => {
    try {
      const verificationResult = await verifyAndLogProduct(scannedProductId);
      setResult(verificationResult);
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed: ' + error.message);
    }
  };

  // Manual verify triggered by button or Enter key. Validates input before
  // delegating to handleScan which contains the shared verification logic.
  const handleManualVerify = async () => {
    if (!productId.trim()) {
      alert('Please enter a product ID');
      return;
    }
    await handleScan(productId);
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
        {/* Header: icon, title and subtitle */}
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
            {/* Camera icon reinforces the scanning affordance */}
            <Camera size={40} style={{ color: 'white' }} />
          </div>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '28px',
            color: '#1F2937'
          }}>
            Verify Product Authenticity
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#6B7280',
            fontSize: '16px'
          }}>
            Scan QR code or enter Product ID to verify
          </p>
        </div>

        {/* Mode Toggle: buttons to switch between QR scanning and manual input */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '25px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setScanMode(true)}
            style={{
              padding: '12px 24px',
              background: scanMode ? '#4F46E5' : '#F3F4F6',
              color: scanMode ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Camera size={18} />
            Scan QR Code
          </button>
          <button
            onClick={() => setScanMode(false)}
            style={{
              padding: '12px 24px',
              background: !scanMode ? '#4F46E5' : '#F3F4F6',
              color: !scanMode ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Search size={18} />
            Manual Entry
          </button>
        </div>

        {/* Scanner or Manual Input: show loader when contract call is in progress */}
        {loading ? (
          <Loader message="Verifying product..." />
        ) : scanMode ? (
          <QRCodeInput 
            onScanSuccess={handleScan}
            onScanError={(err) => console.error('Scan error:', err)}
          />
        ) : (
          <div>
            {/* Manual input for product ID */}
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter Product ID (e.g., PROD-001)"
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '12px',
                fontFamily: 'monospace'
              }}
              // Allow Enter to trigger verification for convenience
              onKeyPress={(e) => e.key === 'Enter' && handleManualVerify()}
            />
            <button
              onClick={handleManualVerify}
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
                transition: 'all 0.2s'
              }}
            >
              Verify Product
            </button>
          </div>
        )}

        {/* Result: show verification details when available */}
        {result && (
          <div style={{ marginTop: '30px' }}>
            <VerificationResult result={result} productId={productId} />
          </div>
        )}

        {/* Info Footer: static explanatory text about logging and location usage */}
        <div style={{
          marginTop: '30px',
          padding: '16px',
          background: '#F9FAFB',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#6B7280',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            ✅ Your scan is logged for fraud detection
          </p>
          <p style={{ margin: 0 }}>
            📍 Location data helps manufacturers identify counterfeit sources
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsumerVerification;