import React from 'react';
import { ShieldAlert } from 'lucide-react';

const DuplicateProducts = ({ duplicates }) => {
  if (!duplicates || duplicates.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <ShieldAlert size={24} style={{ color: '#F59E0B' }} />
          <h3 style={{ margin: 0, fontSize: '20px', color: '#1F2937' }}>
            Duplicate Product Scans
          </h3>
        </div>
        <p style={{ margin: 0, color: '#6B7280', textAlign: 'center', padding: '20px' }}>
          No duplicate scans detected
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '30px'
    }}>
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px'
        }}>
          <ShieldAlert size={24} style={{ color: '#F59E0B' }} />
          <h3 style={{ margin: 0, fontSize: '20px', color: '#1F2937' }}>
            Duplicate Product Scans
          </h3>
        </div>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
          Products marked as "SOLD" but scanned multiple times indicate copied QR codes
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {duplicates.map((product, idx) => (
            <div
              key={idx}
              style={{
                padding: '20px',
                background: '#FEF3C7',
                border: '2px solid #F59E0B',
                borderLeft: '4px solid #F59E0B',
                borderRadius: '8px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#92400E',
                    fontFamily: 'monospace'
                  }}>
                    Product ID: {product._id}
                  </p>
                  <p style={{
                    margin: '4px 0',
                    fontSize: '14px',
                    color: '#78350F'
                  }}>
                    Scanned <strong>{product.count}</strong> times after being marked as sold
                  </p>
                  <p style={{
                    margin: '4px 0',
                    fontSize: '14px',
                    color: '#78350F'
                  }}>
                    From <strong>{product.locations.length}</strong> different locations
                  </p>
                </div>
                <span style={{
                  padding: '6px 12px',
                  background: '#F59E0B',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  COPIED QR
                </span>
              </div>

              {/* Show locations */}
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#78350F'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                  Scan Locations:
                </p>
                {product.locations.slice(0, 3).map((loc, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>
                    📍 {loc.address || `${loc.coordinates?.[1]?.toFixed(4)}, ${loc.coordinates?.[0]?.toFixed(4)}`}
                    {' - '}
                    {new Date(loc.timestamp).toLocaleString()}
                  </div>
                ))}
                {product.locations.length > 3 && (
                  <div style={{ marginTop: '8px', fontWeight: '600' }}>
                    + {product.locations.length - 3} more locations
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DuplicateProducts;