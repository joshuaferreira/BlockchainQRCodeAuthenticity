import api from '../utils/api';

export const productService = {
  // Get all products
  getAllProducts: async (filters = {}) => {
    try {
      const response = await api.get('/products', { params: filters });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get product statistics
  getProductStats: async () => {
    try {
      const response = await api.get('/products/stats');
      return response;
    } catch (error) {
      throw error;
    }
  }
};