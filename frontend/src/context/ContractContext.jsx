import React, { createContext, useContext } from "react";
import useContract from "../hooks/useContract";

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
    const {
        contract,
        account,
        network,
        error,
        owner,
        isAdmin,
        isManufacturer,
        isRetailer,
        isConsumer,
    } = useContract();

    return (
        <ContractContext.Provider
            value={{
                contract,
                account,
                network,
                error,
                owner,
                isAdmin,
                isManufacturer,
                isRetailer,
                isConsumer,
            }}
        >
            {children}
        </ContractContext.Provider>
    );
};

export const useContractContext = () => {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error("useContractContext must be used within a ContractProvider");
    }
    return context;
};
