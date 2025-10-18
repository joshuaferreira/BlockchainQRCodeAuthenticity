export const validateProductId = (productId) => {
  if (!productId || productId.trim().length === 0) {
    return 'Product ID is required';
  }
  if (productId.length < 3) {
    return 'Product ID must be at least 3 characters';
  }
  return null;
};

export const validateBatchNumber = (batchNumber) => {
  if (!batchNumber || batchNumber.trim().length === 0) {
    return 'Batch number is required';
  }
  return null;
};