import ProductVerifierABI from './ProductVerifier.json';

// Replace with your deployed contract address from Step 1.2
export const CONTRACT_ADDRESS = "0x54F6caD80689d4c85fb379a86eeF1D6EAa597644";

export const CONTRACT_ABI = ProductVerifierABI.abi;

export const NETWORK_CONFIG = {
  chainId: 1337,  // Ganache default
  chainName: "Ganache Local",
  rpcUrl: "http://127.0.0.1:7545",
};