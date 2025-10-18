import React, { useState } from 'react';
import './App.css';
import { WalletProvider } from './context/WalletContext';
import { ContractProvider } from './context/ContractContext';
import { UserProvider } from './context/UserContext';
import Header from './components/shared/Header';
import ConsumerVerification from './components/consumer/ConsumerVerification';
import ProductRegistration from './components/manufacturer/ProductRegistration';
import ProductList from './components/manufacturer/ProductList';
import ManufacturerDashboard from './components/manufacturer/ManufacturerDashboard';
import SaleRecording from './components/retailer/SaleRecording';
import RetailerDashboard from './components/retailer/RetailerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function AppContent() {
  const [currentView, setCurrentView] = useState('consumer');

  const renderView = () => {
    switch (currentView) {
      case 'consumer':
        return <ConsumerVerification />;
      case 'manufacturer-register':
        return <ProductRegistration />;
      case 'manufacturer-dashboard':
        return <ManufacturerDashboard />;
      case 'manufacturer-products':
        return <ProductList />;
      case 'retailer':
        return <SaleRecording />;
      case 'retailer-dashboard':
        return <RetailerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <ConsumerVerification />;
    }
  };

  return (
    <div className="App">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <ContractProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ContractProvider>
    </WalletProvider>
  );
}

export default App;