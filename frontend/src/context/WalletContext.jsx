import React, { createContext, useContext } from "react";
import useWallet from "../hooks/useWallet";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const wallet = useWallet(); // use your hook

  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
};



// Custom hook to consume the context
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};

