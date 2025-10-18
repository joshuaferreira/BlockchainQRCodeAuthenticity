import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

const QRCodeGenerator = ({ productId, size = 256 }) => {
  // Generate QR data
  const qrData = productId;

  // Download QR as PNG
  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${productId}`);
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${productId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        padding: '20px', 
        background: 'white',
        borderRadius: '12px',
        display: 'inline-block',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <QRCodeCanvas
          id={`qr-${productId}`}
          value={qrData} // <-- See point 2 below
          size={size}
          level="H"
          includeMargin={true}
          // renderAs="canvas" is no longer needed with QRCodeCanvas
        />
        <p style={{ 
          marginTop: '10px', 
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#666'
        }}>
          {productId}
        </p>
      </div>
      
      <button
        onClick={downloadQR}
        style={{
          marginTop: '15px',
          padding: '10px 20px',
          background: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '15px auto 0',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        <Download size={18} />
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeGenerator;