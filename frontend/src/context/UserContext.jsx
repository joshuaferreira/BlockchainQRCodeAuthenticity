import React, { createContext, useState, useEffect, useContext } from 'react';
import { useContractContext } from './ContractContext';
import { useWalletContext } from './WalletContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { contract } = useContractContext();
  const { account } = useWalletContext();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && contract) {
      checkUserRole();
    } else {
      setUserRole(null);
      setLoading(false);
    }
  }, [account, contract]);

  useEffect(() => {
    console.log('UserContext:', { account, userRole, loading });
  }, [account, userRole, loading]);

  const checkUserRole = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      console.log('checkUserRole start', { account, contractAddress: contract.address || contract.target || 'unknown' });

      // Check if owner
      const owner = await contract.owner();
      console.log('contract.owner():', owner);
      if (owner.toLowerCase() === account.toLowerCase()) {
        setUserRole('OWNER');
        setLoading(false);
        return;
      }

      // Check if manufacturer
      const isManufacturer = await contract.authorizedManufacturers(account);
      console.log('authorizedManufacturers:', isManufacturer);
      if (isManufacturer) {
        setUserRole('MANUFACTURER');
        setLoading(false);
        return;
      }

      // Check if retailer
      const isRetailer = await contract.authorizedRetailers(account);
      console.log('authorizedRetailers:', isRetailer);
      if (isRetailer) {
        setUserRole('RETAILER');
        setLoading(false);
        return;
      }

      // Default to consumer
      setUserRole('CONSUMER');
    } catch (err) {
      console.error('Error checking user role:', err);
      setUserRole('CONSUMER');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = userRole === 'OWNER';
  const isManufacturer = userRole === 'MANUFACTURER' || userRole === 'OWNER';
  const isRetailer = userRole === 'RETAILER';
  const isConsumer = userRole === 'CONSUMER';

  return (
    <UserContext.Provider value={{
      userRole,
      isOwner,
      isManufacturer,
      isRetailer,
      isConsumer,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};