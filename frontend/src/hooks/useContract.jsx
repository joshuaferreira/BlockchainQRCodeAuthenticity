import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useWalletContext } from "../context/WalletContext";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractConfig';

function useContract() {
    const { account, network, error } = useWalletContext();
    const [contract, setContract] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManufacturer, setIsManufacturer] = useState(false);
    const [isRetailer, setIsRetailer] = useState(false);
    const [isConsumer, setIsConsumer] = useState(false);
    const [owner, setOwner] = useState(null);

    // Helper to build a signer-connected contract (ethers v6 style)
    const getConnectedContract = async (acct) => {
        const provider = new BrowserProvider(window.ethereum);
        // WalletContext should have already requested access; no prompt here
        const signer = await provider.getSigner(acct);
        return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    };

    useEffect(() => {
        let cancelled = false;

        const loadContract = async () => {
            if (!window.ethereum || !account) {
                if (!cancelled) setContract(null);
                return;
            }

            try {
                const next = await getConnectedContract(account);
                if (!cancelled) setContract(next);
            } catch (err) {
                console.error("Error initializing contract:", err);
                if (!cancelled) setContract(null);
            }
        };

        loadContract();
        return () => { cancelled = true; };
    }, [account, network]);

    useEffect(() => {
        let cancelled = false;

        const fetchRoles = async () => {
            if (!contract || !account) {
                if (!cancelled) {
                    setOwner(null);
                    setIsAdmin(false);
                    setIsManufacturer(false);
                    setIsRetailer(false);
                    // leave isConsumer as-is unless your contract supports it
                }
                return;
            }

            try {
                // Fetch owner and role flags using the existing contract
                const ownerAddr = await contract.owner();
                if (cancelled) return;
                setOwner(ownerAddr);
                setIsAdmin(ownerAddr?.toLowerCase() === account?.toLowerCase());

                const [mStatus, rStatus] = await Promise.all([
                    contract.authorizedManufacturers(account),
                    contract.authorizedRetailers(account)
                ]);
                if (cancelled) return;
                setIsManufacturer(!!mStatus);
                setIsRetailer(!!rStatus);
            } catch (err) {
                console.error("Error fetching roles:", err);
                if (!cancelled) {
                    setIsAdmin(false);
                    setIsManufacturer(false);
                    setIsRetailer(false);
                }
            }
        };

        fetchRoles();
        return () => { cancelled = true; };
    }, [contract, account]);

    return {
        contract,
        account,
        network,
        error,
        owner,
        isAdmin,
        isManufacturer,
        isRetailer,
        isConsumer,
    };
}

export default useContract;
