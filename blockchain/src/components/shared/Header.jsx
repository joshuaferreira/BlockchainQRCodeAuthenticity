import React from 'react';
import { Package, ShieldCheck, Store, Settings, List } from 'lucide-react';
import WalletConnect from './WalletConnect';
import { useUserContext } from '../../context/UserContext';

const Header = ({ currentView, setCurrentView }) => {
  const { userRole, isManufacturer, isRetailer, isOwner } = useUserContext();

  const getNavItems = () => {
    const items = [
      { id: 'consumer', label: 'Verify Product', icon: ShieldCheck, roles: ['all'] }
    ];

    if (isManufacturer || isOwner) {
      items.push(
        { id: 'manufacturer-register', label: 'Register Product', icon: Package, roles: ['MANUFACTURER', 'OWNER'] },
        { id: 'manufacturer-products', label: 'Products', icon: List, roles: ['MANUFACTURER', 'OWNER'] },
        { id: 'manufacturer-dashboard', label: 'Dashboard', icon: Settings, roles: ['MANUFACTURER', 'OWNER'] }
      );
    }

    if (isRetailer) {
      items.push(
        { id: 'retailer', label: 'Record Sale', icon: Store, roles: ['RETAILER'] },
        { id: 'retailer-dashboard', label: 'My Dashboard', icon: Settings, roles: ['RETAILER'] }
      );
    }

    if (isOwner) {
      items.push(
        { id: 'admin', label: 'Admin', icon: Settings, roles: ['OWNER'] }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <header style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={32} style={{ color: '#4F46E5' }} />
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Product Verifier
            </h1>
            {userRole && (
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#6B7280',
                fontWeight: '500'
              }}>
                Role: {userRole}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                style={{
                  padding: '10px 16px',
                  background: currentView === item.id ? '#4F46E5' : '#F3F4F6',
                  color: currentView === item.id ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                <span style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
          
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
};

export default Header;