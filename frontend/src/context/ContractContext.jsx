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
  }, [account, isConnected]);

  const initContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Read-only contract
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        setContract(contractInstance);

        // Contract with signer (for transactions)
        if (isConnected && account) {
          const signer = provider.getSigner();
          const contractWithSignerInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
          setContractWithSigner(contractWithSignerInstance);
        }
      } catch (err) {
        console.error('Contract initialization error:', err);
      }
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