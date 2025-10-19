import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractConfig';
import { useWalletContext } from './WalletContext';

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const { account, isConnected } = useWalletContext();
  const [contract, setContract] = useState(null);
  const [contractWithSigner, setContractWithSigner] = useState(null);

  useEffect(() => {
    initContract();

    // re-init when user switches accounts or networks in wallet
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
      const handleAccounts = () => initContract();
      const handleChain = () => initContract();

      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', handleChain);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccounts);
        window.ethereum.removeListener('chainChanged', handleChain);
      };
    }
  }, [account, isConnected]);

  const initContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('initContract:', { account, isConnected, CONTRACT_ADDRESS, ethersVersion: !!ethers && !!ethers.providers });

        // Support ethers v5 (ethers.providers.Web3Provider) and ethers v6 (ethers.BrowserProvider)
        let provider;
        if (ethers && ethers.providers && ethers.providers.Web3Provider) {
          provider = new ethers.providers.Web3Provider(window.ethereum);
          console.log('using ethers.providers.Web3Provider (v5)');
        } else if (ethers && ethers.BrowserProvider) {
          provider = new ethers.BrowserProvider(window.ethereum);
          console.log('using ethers.BrowserProvider (v6)');
        } else {
          throw new Error('Unsupported ethers version: no compatible provider constructor found');
        }
        console.log('provider created');

        // Read-only contract
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        console.log('set read-only contract instance', contractInstance.address || CONTRACT_ADDRESS);
        setContract(contractInstance);

        // Contract with signer (for transactions)
        if (isConnected && account) {
          if (typeof provider.getSigner === 'function') {
            const signer = provider.getSigner();
            const contractWithSignerInstance = new ethers.Contract(
              CONTRACT_ADDRESS,
              CONTRACT_ABI,
              signer
            );
            console.log('set contractWithSigner instance');
            setContractWithSigner(contractWithSignerInstance);
          } else {
            console.warn('provider.getSigner is not available; cannot create signer contract');
            setContractWithSigner(null);
          }
        } else {
          // explicitly clear signer contract if not connected
          if (contractWithSigner) {
            console.log('clearing contractWithSigner (not connected)');
          }
          setContractWithSigner(null);
        }
      } catch (err) {
        console.error('Contract initialization error:', err);
        setContract(null);
        setContractWithSigner(null);
      }
    } else {
      console.warn('window.ethereum is undefined - no provider available');
      setContract(null);
      setContractWithSigner(null);
    }
  };

  return (
    <ContractContext.Provider value={{
      contract,
      contractWithSigner
    }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContractContext must be used within ContractProvider');
  }
  return context;
};