import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

function useWallet() {
    // State variables
    const [account, setAccount] = useState(null); // Store the connected account
    const [balance, setBalance] = useState(null); // Store the account balance
    const [network, setNetwork] = useState(null); // Store the network name
    const [error, setError] = useState(null); // Store any connection errors
    
    // Create a ref to hold the current account value   
    const accountRef = useRef(account);
    // keep the ref up-to-date whenever account state changes
    useEffect(() => {
        accountRef.current = account;
    }, [account]);


    // Initialize provider
    const getProvider = () => {
        if (typeof window !== "undefined" && window.ethereum) {
            // Connect to the MetaMask EIP-1193 object. This is a standard
            // protocol that allows Ethers access to make all read-only
            // requests through MetaMask.
            return new ethers.BrowserProvider(window.ethereum);
        } else {
            setError("MetaMask not detected");
            return null;
        }
    };

    // Connect wallet
    const connectWallet = async () => {
        try {
            const provider = getProvider();
            if (!provider) return;

            const accounts = await provider.send("eth_requestAccounts", []); // asks the wallet (MetaMask) to prompt the user to connect and returns an array of account addresses (e.g. ["0xabc..."])
            const network = await provider.getNetwork();                     // queries the provider for the current network info (object with chainId and name, e.g. { chainId: 1, name: "homestead" })
            const balance = await provider.getBalance(accounts[0]);          // fetches the account balance (in wei) for the first returned address (returns a BigInt/BigNumber-like value)

            setAccount(accounts[0]); // store the connected account address in state
            setNetwork(network.name); // store the human-readable network name in state
            setBalance(ethers.formatEther(balance)); // format wei to ether string and store in state
            setError(null); // clear any previous error
        } catch (err) {
            setError(err.message);
        }
    };

    // Auto-detect changes in accounts or network
    useEffect(
        () => {
            if (!window.ethereum?.on) return;

            const handleAccountsChanged = async (accounts) => {
                if (!accounts || accounts.length === 0) {
                    setAccount(null);
                    setBalance(null);
                    setNetwork(null);
                    return;
                }

                const addr = accounts[0].address || accounts[0];
                setAccount(addr);

                const provider = getProvider();
                if (!provider) {
                    setBalance(null);
                    setNetwork(null);
                    return;
                }

                try {
                    const [bal, net] = await Promise.all([
                        provider.getBalance(addr),
                        provider.getNetwork(),
                    ]);
                    setBalance(ethers.formatEther(bal));
                    setNetwork(net.name);
                } catch (err) {
                    setError(err.message || "Failed to update balance/network");
                }
            };

            const handleChainChanged = async () => {
                const provider = getProvider();
                if (!provider) return;

                try {
                    const net = await provider.getNetwork();
                    setNetwork(net.name);

                    const current = accountRef.current;
                    if (current) {
                        const bal = await provider.getBalance(current);
                        setBalance(ethers.formatEther(bal));
                    }
                } catch (err) {
                    setError(err.message || "Failed to update on chain change");
                }
            };

            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);

            return () => {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            };
        }
    , 
    []);

    // Auto-connect if MetaMask already authorized
    useEffect(
        () => 
            {
                const checkConnection = async () => {
                    const provider = getProvider();
                    if (!provider) return;

                    try {
                    const accounts = await provider.listAccounts();
                    if (accounts.length > 0) {
                        const network = await provider.getNetwork();
                        const balance = await provider.getBalance(accounts[0]);

                        setAccount(accounts[0].address || accounts[0]);
                        setNetwork(network.name);
                        setBalance(ethers.formatEther(balance));
                    }
                    } catch (err) {
                    console.error("Auto-connect error:", err);
                    }
                };

                checkConnection();
            }
    , 
    []);

    return { account, balance, network, error, connectWallet };
}

export default useWallet;
