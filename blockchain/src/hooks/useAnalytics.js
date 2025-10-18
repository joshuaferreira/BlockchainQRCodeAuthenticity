import { useState, useEffect } from 'react';
import { fetchAnalytics, fetchSuspiciousProducts } from '../services/analyticsService';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [suspiciousProducts, setSuspiciousProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, suspiciousData] = await Promise.all([
        fetchAnalytics(),
        fetchSuspiciousProducts()
      ]);
      setAnalytics(analyticsData);
      setSuspiciousProducts(suspiciousData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return {
    analytics,
    suspiciousProducts,
    loading,
    error,
    refresh: loadAnalytics
  };
};