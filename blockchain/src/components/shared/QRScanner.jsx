import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, StopCircle, AlertCircle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [error, setError] = useState(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera on mobile
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
          setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
        }
      })
      .catch((err) => {
        setError('No cameras found');
        console.error('Camera error:', err);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('No camera selected');
      return;
    }

    try {
      setError(null);
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');

      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Parse QR data
          try {
            const data = JSON.parse(decodedText);
            onScanSuccess(data.productId || decodedText);
          } catch (e) {
            // If not JSON, treat as plain product ID
            onScanSuccess(decodedText);
          }
          stopScanning();
        },
        (errorMessage) => {
          // Scanning errors (can be ignored, happens frequently)
          console.debug('Scan error:', errorMessage);
        }
      );

      setScanning(true);
    } catch (err) {
      setError('Failed to start camera: ' + err.message);
      if (onScanError) onScanError(err);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Stop scanning error:', err);
      }
    }
    setScanning(false);
  };

  return (
    <div style={{ width: '100%' }}>
      {error && (
        <div style={{
          padding: '12px',
          background: '#FEE2E2',
          color: '#991B1B',
          borderRadius: '8px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {cameras.length > 1 && !scanning && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151'
          }}>
            Select Camera:
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        id="qr-reader"
        style={{
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: scanning ? '3px solid #4F46E5' : '3px dashed #D1D5DB',
          minHeight: scanning ? 'auto' : '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F9FAFB'
        }}
      >
        {!scanning && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Camera size={64} color="#9CA3AF" />
            <p style={{ marginTop: '15px', color: '#6B7280' }}>
              Click start to scan QR code
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        {!scanning ? (
          <button
            onClick={startScanning}
            disabled={!selectedCamera}
            style={{
              flex: 1,
              padding: '12px 24px',
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
            <Camera size={20} />
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: '#DC2626',
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
            <StopCircle size={20} />
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;