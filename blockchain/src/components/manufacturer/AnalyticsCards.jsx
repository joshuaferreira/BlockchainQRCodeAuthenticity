import React from 'react';
import { Package, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';

const AnalyticsCards = ({ statistics }) => {
  const stats = statistics || [];
  const authenticCount = stats.find(s => s._id === 'AUTHENTIC')?.count || 0;
  const notFoundCount = stats.find(s => s._id === 'NOT_FOUND')?.count || 0;
  const alreadySoldCount = stats.find(s => s._id === 'ALREADY_SOLD')?.count || 0;
  const totalScans = authenticCount + notFoundCount + alreadySoldCount;

  const cards = [
    {
      title: 'Total Scans',
      value: totalScans,
      icon: Package,
      color: '#4F46E5',
      bgColor: '#EEF2FF'
    },
    {
      title: 'Authentic',
      value: authenticCount,
      icon: TrendingUp,
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      title: 'Not Found (Fake IDs)',
      value: notFoundCount,
      icon: AlertTriangle,
      color: '#DC2626',
      bgColor: '#FEE2E2'
    },
    {
      title: 'Already Sold (Duplicates)',
      value: alreadySoldCount,
      icon: MapPin,
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #E5E7EB'
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
                  {card.value.toLocaleString()}
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
  );
};

export default AnalyticsCards;