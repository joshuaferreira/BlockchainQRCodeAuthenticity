import { useState, useEffect } from 'react';
import { useWalletContext } from '../context/WalletContext';
  

export const useWallet = () => {
  const { account, isConnected, chainId, connectWallet } = useWalletContext();

  return {
    account,
    isConnected,
    chainId,
    connectWallet
  };
};
// Alternative implementation without context
export const useWalletAlt = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', handleChainChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
        window.ethereum.removeListener('chainChanged', handleChainChange);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Check connection error:', err);
      }
    }
  };

  const handleAccountChange = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChange = (chainId) => {
    setChainId(chainId);
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
      setIsConnected(true);
      return accounts[0];
    } catch (err) {
      throw new Error('Failed to connect wallet');
    }
  };

  return {
    account,
    isConnected,
    chainId,
    connectWallet
  };
};