import React, { useState, useEffect } from 'react';
import { Store, Package, TrendingUp, DollarSign } from 'lucide-react';
import Loader from '../shared/Loader';

const RetailerDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    productsVerified: 0,
    revenue: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - In production, fetch from blockchain/backend
    setTimeout(() => {
      setStats({
        totalSales: 156,
        todaySales: 12,
        productsVerified: 143,
        revenue: 45600
      });

      setRecentSales([
        {
          productId: 'ELE-123456-001',
          productName: 'iPhone 15 Pro',
          saleDate: new Date(),
          status: 'new',
          location: 'Store NYC-001'
        },
        {
          productId: 'ELE-123457-002',
          productName: 'Samsung Galaxy S24',
          saleDate: new Date(Date.now() - 3600000),
          status: 'new',
          location: 'Store NYC-001'
        },
        {
          productId: 'PHA-123458-003',
          productName: 'Medicine XYZ',
          saleDate: new Date(Date.now() - 7200000),
          status: 'new',
          location: 'Store NYC-001'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <Loader message="Loading retailer dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: Package,
      color: '#4F46E5',
      bgColor: '#EEF2FF'
    },
    {
      title: 'Today\'s Sales',
      value: stats.todaySales,
      icon: TrendingUp,
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      title: 'Products Verified',
      value: stats.productsVerified,
      icon: Store,
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#8B5CF6',
      bgColor: '#F3E8FF'
    }
  ];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '30px'
      }}>
        <Store size={36} style={{ color: '#4F46E5' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', color: '#1F2937' }}>
            Retailer Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6B7280' }}>
            Sales overview and product verification
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    {card.title}
                  </p>
                  <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: card.color
                  }}>
                    {card.value}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: card.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} style={{ color: card.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sales */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '30px'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          color: '#1F2937'
        }}>
          Recent Sales
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Product ID
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Product Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Sale Date
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, idx) => (
                <tr 
                  key={idx}
                  style={{ borderBottom: '1px solid #E5E7EB' }}
                >
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '14px', color: '#4F46E5', fontWeight: '600' }}>
                    {sale.productId}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1F2937' }}>
                    {sale.productName}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                    {sale.saleDate.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#D1FAE5',
                      color: '#065F46'
                    }}>
                      {sale.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                    {sale.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;