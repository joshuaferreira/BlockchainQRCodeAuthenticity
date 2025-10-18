import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import AnalyticsCards from './AnalyticsCards';
import SuspiciousLocations from './SuspiciousLocations';
import DuplicateProducts from './DuplicateProducts';
import Loader from '../shared/Loader';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ManufacturerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/scans/analytics`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        <Loader message="Loading fraud detection dashboard..." />
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '40px auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            color: '#1F2937'
          }}>
            Fraud Detection Dashboard
          </h1>
          <p style={{
            margin: 0,
            color: '#6B7280',
            fontSize: '16px'
          }}>
            Real-time analytics and suspicious activity monitoring
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '12px 24px',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <RefreshCw 
            size={18} 
            style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}
          />
          Refresh Data
        </button>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards statistics={analytics?.statistics} />

      {/* Suspicious Locations */}
      <SuspiciousLocations locations={analytics?.suspiciousLocations} />

      {/* Duplicate Products */}
      <DuplicateProducts duplicates={analytics?.duplicateProducts} />

      {/* Summary Info */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '24px'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#1F2937'
        }}>
          Dashboard Information
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          fontSize: '14px',
          color: '#6B7280'
        }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151' }}>
              📊 How It Works
            </p>
            <p style={{ margin: 0 }}>
              All consumer scans are logged with GPS coordinates to detect counterfeit patterns
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151' }}>
              🚨 Suspicious Locations
            </p>
            <p style={{ margin: 0 }}>
              High concentration of "NOT_FOUND" scans indicates fake products being sold
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151' }}>
              📱 Duplicate Scans
            </p>
            <p style={{ margin: 0 }}>
              Multiple scans of "SOLD" products from different locations indicate copied QR codes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;