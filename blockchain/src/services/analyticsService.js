import axios from 'axios';
import { API_BASE_URL } from '../contracts/contractConfig';

export const fetchAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scans/analytics`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};

export const fetchSuspiciousProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scans/suspicious`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch suspicious products:', error);
    throw error;
  }
};

export const fetchScansNearLocation = async (latitude, longitude, radius = 5000) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/scans/nearby`, {
      params: { latitude, longitude, radius }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch nearby scans:', error);
    throw error;
  }
};