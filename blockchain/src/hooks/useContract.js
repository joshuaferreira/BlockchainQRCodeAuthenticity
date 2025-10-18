import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractConfig';
import { logScan } from '../services/scanService';
import { getCurrentLocation } from '../utils/blockchain';

export const useContract = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initContract();
  }, []);

  const initContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Use this for ethers v6
        const provider = new ethers.BrowserProvider(window.ethereum);        
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        setContract(contractInstance);
      } catch (err) {
        console.error('Contract init error:', err);
      }
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
      return accounts[0];
    } catch (err) {
      setError('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndLogProduct = async (productId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      setLoading(true);
      
      // Check blockchain
      const result = await contract.quickVerify(productId);
      
      let scanResult;
      let message;

      if (!result.exists) {
        scanResult = 'NOT_FOUND';
        message = '⚠️ COUNTERFEIT DETECTED!';
      } else if (result.status === 0) {
        scanResult = 'AUTHENTIC';
        message = '✅ AUTHENTIC PRODUCT!';
      } else {
        scanResult = 'ALREADY_SOLD';
        message = '⚠️ WARNING! Already sold.';
      }

      // Log to backend
      const location = await getCurrentLocation();
      await logScan({
        productId,
        scanResult,
        latitude: location?.latitude,
        longitude: location?.longitude,
        blockchainData: {
          manufacturer: result.manufacturer,
          batchNumber: result.batchNumber,
          status: result.status === 0 ? 'Available' : 'Sold'
        }
      });

      return { ...result, scanResult, message };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    account,
    contract,
    loading,
    error,
    connectWallet,
    verifyAndLogProduct
  };
};

/*
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractConfig';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const useContract = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
          setContract(contractInstance);
        } catch (err) {
          console.error('Failed to initialize contract:', err);
        }
      }
    };

    initContract();
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Location access denied:', error);
            resolve(null);
          }
        );
      } else {
        resolve(null);
      }
    });
  };

  // Log scan to backend
  const logScanToBackend = async (productId, scanResult, blockchainData = {}) => {
    try {
      const location = await getCurrentLocation();
      
      const scanData = {
        productId,
        scanResult,
        latitude: location?.latitude,
        longitude: location?.longitude,
        blockchainData,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      };

      await axios.post(`${API_BASE_URL}/scans`, scanData);
      console.log('✅ Scan logged to backend');
    } catch (error) {
      console.error('Failed to log scan:', error);
      // Don't fail the main operation if logging fails
    }
  };

  // Verify and Log Product (Main Consumer Function)
  const verifyAndLogProduct = async (productId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      setLoading(true);
      setError(null);

      // Step 1: Check blockchain
      const result = await contract.quickVerify(productId);
      
      let scanResult;
      let message;
      let blockchainData = {};

      if (!result.exists) {
        // Product not found - COUNTERFEIT
        scanResult = 'NOT_FOUND';
        message = '⚠️ COUNTERFEIT DETECTED! This product is not registered on the blockchain.';
      } else {
        blockchainData = {
          manufacturer: result.manufacturer,
          batchNumber: result.batchNumber,
          status: result.status === 0 ? 'Available' : 'Sold'
        };

        if (result.status === 0) {
          // Status: Available - AUTHENTIC
          scanResult = 'AUTHENTIC';
          message = '✅ AUTHENTIC PRODUCT! This product is genuine and available.';
        } else {
          // Status: Sold - POTENTIAL COUNTERFEIT
          scanResult = 'ALREADY_SOLD';
          message = '⚠️ WARNING! This product has already been sold. This may be a counterfeit with a copied QR code.';
        }
      }

      // Step 2: Log to backend (async, don't wait)
      logScanToBackend(productId, scanResult, blockchainData);

      // Step 3: Return result to user
      return {
        exists: result.exists,
        status: result.status,
        manufacturer: result.manufacturer,
        batchNumber: result.batchNumber,
        scanResult,
        message,
        blockchainData
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark product as sold (retailer function)
  const markAsSold = async (productId, buyerAddress, storeLocation) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      setLoading(true);
      setError(null);

      const tx = await contract.markAsSold(productId, buyerAddress, storeLocation);
      const receipt = await tx.wait();
      
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    account,
    contract,
    loading,
    error,
    verifyAndLogProduct,
    markAsSold,
    // ... other functions
  };
};
*/