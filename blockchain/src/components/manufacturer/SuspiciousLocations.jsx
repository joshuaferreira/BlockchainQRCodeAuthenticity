import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

const SuspiciousLocations = ({ locations }) => {
  if (!locations || locations.length === 0) {
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
          <MapPin size={24} style={{ color: '#DC2626' }} />
          <h3 style={{ margin: 0, fontSize: '20px', color: '#1F2937' }}>
            Suspicious Locations
          </h3>
        </div>
        <p style={{ margin: 0, color: '#6B7280', textAlign: 'center', padding: '20px' }}>
          No suspicious locations detected
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
          <MapPin size={24} style={{ color: '#DC2626' }} />
          <h3 style={{ margin: 0, fontSize: '20px', color: '#1F2937' }}>
            Suspicious Locations (Fake Products)
          </h3>
        </div>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
          Locations with high "NOT_FOUND" scans indicate retailers selling counterfeit products
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {locations.map((location, idx) => (
            <div
              key={idx}
              style={{
                padding: '20px',
                background: '#FEE2E2',
                border: '2px solid #DC2626',
                borderLeft: '4px solid #DC2626',
                borderRadius: '8px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <MapPin size={18} style={{ color: '#991B1B' }} />
                    <p style={{
                      margin: 0,
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#991B1B'
                    }}>
                      Location: {location._id.lat?.toFixed(4)}, {location._id.lng?.toFixed(4)}
                    </p>
                  </div>
                  <p style={{
                    margin: '4px 0',
                    fontSize: '14px',
                    color: '#7F1D1D'
                  }}>
                    <strong>{location.count}</strong> scans of non-existent products
                  </p>
                  <p style={{
                    margin: '4px 0',
                    fontSize: '14px',
                    color: '#7F1D1D'
                  }}>
                    <strong>{location.products.length}</strong> unique fake product IDs detected
                  </p>
                </div>
                <span style={{
                  padding: '6px 12px',
                  background: '#DC2626',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  HIGH RISK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuspiciousLocations;