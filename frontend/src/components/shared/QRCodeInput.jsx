import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, StopCircle, AlertCircle, Upload, File, Image as ImageIcon, X } from 'lucide-react';

// Configuration for QR scanner
const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

const QRCodeInput = ({ onScanSuccess, onScanError }) => {
  // Camera State
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const html5QrCodeRef = useRef(null);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Shared State
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // General loading state

  // --- Utility Functions ---

  const clearError = () => setError(null);

  // Cleanup function for scanner instance
  const stopAndClearScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear(); // Clear resources
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Error stopping/clearing scanner:', err);
        // Don't set error state here, as it might interfere with success flow
      }
    }
    setScanning(false);
  }, []);

  // Parses result - handles plain text or JSON containing productId
  const handleDecodedText = (decodedText) => {
    clearError();
    setLoading(false); // Scanning finished
    try {
      // Attempt to parse as JSON first (if you generated JSON QR codes)
      const data = JSON.parse(decodedText);
      if (data && data.productId) {
        onScanSuccess(data.productId);
      } else {
        // If JSON doesn't have productId, treat whole string as ID
        onScanSuccess(decodedText);
      }
    } catch (e) {
      // If it's not valid JSON, treat the whole string as the product ID
      onScanSuccess(decodedText);
    }
    stopAndClearScanner(); // Stop camera on success
    clearUploadState(); // Clear file upload state on success
  };

  const handleScanFailure = (errorMessage) => {
    // html5-qrcode calls this frequently when no QR code is found in frame
    // We generally ignore these unless it's a critical setup error
    console.debug('QR Scan Error (usually ignorable):', errorMessage);
    // Potentially set a transient error state if needed, but often not required
  };

  // --- Camera Logic ---

  // Fetch cameras on mount
  useEffect(() => {
    setLoading(true);
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
          setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
        } else {
          setError('No cameras found.');
        }
      })
      .catch((err) => {
        setError('Could not access cameras. Please grant permission.');
        console.error('Camera access error:', err);
      })
      .finally(() => setLoading(false));

    // Cleanup on unmount
    return () => {
      stopAndClearScanner();
    };
  }, [stopAndClearScanner]); // Include dependency

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('No camera selected');
      return;
    }
    if (html5QrCodeRef.current || scanning) {
        console.warn("Scanner already active or instance exists.");
        await stopAndClearScanner(); // Ensure clean state before starting
    }

    clearError();
    clearUploadState(); // Clear any uploaded file
    setLoading(true);

    try {
      // Ensure the element exists
      const readerElement = document.getElementById('qr-reader-container');
      if (!readerElement) {
        throw new Error("QR Reader container element not found in DOM.");
      }

      const newScanner = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = newScanner;

      await newScanner.start(
        selectedCamera,
        qrConfig,
        handleDecodedText,
        handleScanFailure
      );
      setScanning(true);
    } catch (err) {
      setError(`Failed to start camera: ${err.message || err}`);
      if (onScanError) onScanError(err);
      html5QrCodeRef.current = null; // Clear ref on error
    } finally {
      setLoading(false);
    }
  };

  // Stop scanning bound to component instance
  const handleStopScanning = () => {
    stopAndClearScanner();
  };

  // --- File Upload Logic ---

  const clearUploadState = () => {
    setUploadedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  // Trigger hidden file input click
  const triggerFileInput = () => {
    clearError(); // Clear errors when initiating new action
    fileInputRef.current?.click();
  };

  // Handle file selection (from input or drop)
  const handleFileSelect = (file) => {
    clearError();
    setScanResult(null); // Clear previous scan result if any

    if (!file) {
      setError("No file selected.");
      return;
    }

    // Stop camera if it's running
    if (scanning) {
      stopAndClearScanner();
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG)');
      clearUploadState();
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      clearUploadState();
      return;
    }

    setLoading(true);

    // Store file info
    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type
    });

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      // Now, try to scan the file
      scanFileForQR(file);
    };
    reader.onerror = () => {
        setError("Failed to read file.");
        setLoading(false);
        clearUploadState();
    }
    reader.readAsDataURL(file);
  };

  // Scan the selected file using html5-qrcode
  const scanFileForQR = async (file) => {
    setLoading(true);
    try {
      if (!file) throw new Error('No file provided');

      // If we already have an Html5Qrcode instance (camera mode), reuse it
      if (html5QrCodeRef.current && typeof html5QrCodeRef.current.scanFile === 'function') {
        const decodedText = await html5QrCodeRef.current.scanFile(file, /* showImage= */ false);
        handleDecodedText(decodedText);
        return;
      }

      // Create a temporary hidden element with a deterministic id so Html5Qrcode won't get `undefined`
      const tempId = `html5-qrcode-temp-${Date.now()}`;
      const tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-10000px';
      tempDiv.style.top = '-10000px';
      document.body.appendChild(tempDiv);

      const fileScanner = new Html5Qrcode(tempId);
      try {
        const decodedText = await fileScanner.scanFile(file, /* showImage= */ false);
        handleDecodedText(decodedText);
      } finally {
        // cleanup the scanner and DOM node
        try { await fileScanner.clear(); } catch (e) { /* ignore cleanup errors */ }
        if (tempDiv && tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
      }
    } catch (err) {
      const errMsg = err?.message || String(err);
      setError(errMsg);
      if (onScanError) onScanError(err);
      console.error('scanFileForQR error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change event
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  // Drag and Drop Handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };

  // Clear everything
  const handleClear = () => {
    clearError();
    stopAndClearScanner();
    clearUploadState();
    setScanResult(null); // Ensure scan result is cleared too
  }

  // --- Render Logic ---
  const [scanResult, setScanResult] = useState(null); // Added state for scan result display

  return (
    <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '25px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

      {/* Error Display */}
      {error && (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
          <button onClick={clearError} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4F46E5' }}>
                   <div className="spin"><Camera size={24} /></div> {/* Reusing spin animation */}
                   <span>{scanning ? 'Starting Camera...' : 'Processing...'}</span>
               </div>
           </div>
       )}


      {/* Camera Section */}
      {!imagePreview && ( // Only show camera UI if no file is previewed
        <>
          {cameras.length > 1 && !scanning && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Select Camera:</label>
              <select value={selectedCamera || ''} onChange={(e) => setSelectedCamera(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}>
                {cameras.map((camera) => (<option key={camera.id} value={camera.id}>{camera.label}</option>))}
              </select>
            </div>
          )}

          {/* Camera Viewport Area */}
          <div id="qr-reader-container" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: scanning ? '3px solid #4F46E5' : '3px dashed #D1D5DB', minHeight: scanning ? 'auto' : '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', marginBottom: '15px' }}>
            {!scanning && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <Camera size={50} />
                <p style={{ marginTop: '10px', fontSize: '14px' }}>Camera is off</p>
              </div>
            )}
          </div>

          {/* Start/Stop Scan Button */}
          {!scanning ? (
            <button onClick={startScanning} disabled={!selectedCamera || loading} style={buttonStyle('#4F46E5')}>
              <Camera size={18} /> Start Camera Scan
            </button>
          ) : (
            <button onClick={handleStopScanning} style={buttonStyle('#DC2626')}>
              <StopCircle size={18} /> Stop Camera Scan
            </button>
          )}
        </>
      )}

      {/* Separator */}
      {!imagePreview && !scanning && (
         <div style={{ textAlign: 'center', margin: '20px 0', color: '#9CA3AF', fontSize: '14px', fontWeight: '500' }}>
           OR
         </div>
       )}


      {/* File Upload Section */}
      {!scanning && ( // Only show upload UI if camera isn't running
        <>
          {imagePreview ? (
            // Image Preview and File Info
            <div>
               <p style={{ fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '10px' }}>Uploaded Image:</p>
              <div style={{ border: '3px solid #4F46E5', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', background: '#F9FAFB', textAlign: 'center' }}>
                <img src={imagePreview} alt="QR Code Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
              </div>
              {uploadedFile && (
                <div style={{ background: '#F3F4F6', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <File size={20} style={{ color: '#4B5563', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: '500', color: '#1F2937' }}>{uploadedFile.name}</span>
                    <span style={{ color: '#6B7280', marginLeft: '10px' }}>({uploadedFile.size})</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Drop Zone
            <div
              onClick={triggerFileInput}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{ minHeight: '150px', border: isDragging ? '3px solid #4F46E5' : '3px dashed #D1D5DB', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isDragging ? '#EEF2FF' : '#F9FAFB', cursor: 'pointer', transition: 'all 0.2s', padding: '20px', textAlign: 'center' }}
            >
              <Upload size={40} color={isDragging ? '#4F46E5' : '#9CA3AF'} />
              <p style={{ marginTop: '10px', color: isDragging ? '#4F46E5' : '#6B7280', fontSize: '16px', fontWeight: '600' }}>
                {isDragging ? 'Drop image here' : 'Click or Drag QR Image'}
              </p>
              <p style={{ marginTop: '5px', color: '#9CA3AF', fontSize: '12px' }}>PNG, JPG, JPEG (max 5MB)</p>
            </div>
          )}

          {/* Hidden File Input */}
          <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleInputChange} style={{ display: 'none' }} />

           {/* Upload/Clear Button */}
           <div style={{ marginTop: '15px' }}>
               {!imagePreview ? (
                   <button onClick={triggerFileInput} style={buttonStyle('#6B7280', true)}>
                       <ImageIcon size={18} /> Choose Image File
                   </button>
               ) : (
                   <button onClick={handleClear} style={buttonStyle('#EF4444', true)}>
                       <X size={18} /> Clear Upload & Scan
                   </button>
               )}
           </div>

        </>
      )}

       {/* Display Scan Result if available (optional) */}
       {scanResult && (
           <div style={{ marginTop: '20px', padding: '15px', background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', fontSize: '14px' }}>
               <strong>Scan Success:</strong> Product ID {scanResult.productId} found. {/* Adjust based on actual result structure */}
           </div>
       )}


    </div>
  );
};

// Helper for button styling
const buttonStyle = (bgColor, fullWidth = true) => ({
  width: fullWidth ? '100%' : 'auto',
  padding: '12px 20px',
  background: bgColor,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex', // Use inline-flex for auto width
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'opacity 0.2s',
  ':disabled': { // Note: This won't work directly in inline styles
    opacity: 0.6,
    cursor: 'not-allowed',
  }
});


export default QRCodeInput;