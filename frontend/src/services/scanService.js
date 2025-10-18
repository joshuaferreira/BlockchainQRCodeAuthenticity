import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const logScan = async (scanData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scans`, scanData);
    return response.data;
  } catch (error) {
    console.error('Failed to log scan:', error);
    throw error;
  }
};

export const getAllScans = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scans`, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch scans:', error);
    throw error;
  }
};