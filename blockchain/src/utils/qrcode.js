import QRCode from 'qrcode';

// Generate QR code as Data URL
export const generateQRCodeDataURL = async (data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      ...options
    };

    const dataURL = await QRCode.toDataURL(data, defaultOptions);
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QR code as Canvas
export const generateQRCodeCanvas = async (canvasElement, data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      ...options
    };

    await QRCode.toCanvas(canvasElement, data, defaultOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Download QR code as PNG
export const downloadQRCode = async (data, filename = 'qrcode.png', options = {}) => {
  try {
    const dataURL = await generateQRCodeDataURL(data, options);
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
};

// Create product QR data
export const createProductQRData = (productId, additionalData = {}) => {
  const qrData = {
    productId,
    timestamp: Date.now(),
    verifyUrl: `${window.location.origin}/verify/${productId}`,
    ...additionalData
  };
  return JSON.stringify(qrData);
};

// Parse product QR data
export const parseProductQRData = (qrString) => {
  try {
    const data = JSON.parse(qrString);
    return data;
  } catch (error) {
    // If not JSON, return as plain product ID
    return { productId: qrString };
  }
};

// Batch generate QR codes
export const batchGenerateQRCodes = async (products, options = {}) => {
  try {
    const qrCodes = await Promise.all(
      products.map(async (product) => {
        const qrData = createProductQRData(product.productId);
        const dataURL = await generateQRCodeDataURL(qrData, options);
        return {
          productId: product.productId,
          qrCode: dataURL
        };
      })
    );
    return qrCodes;
  } catch (error) {
    console.error('Error batch generating QR codes:', error);
    throw error;
  }
};