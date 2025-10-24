import { useWalletContext } from "../context/WalletContext";
import { useContractContext } from '../context/ContractContext';

export function UserInfo() {
  const { account, balance, network, error, connectWallet } = useWalletContext();
  const { contract, isAdmin, isManufacturer, isRetailer, isConsumer } = useContractContext();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <h2>Wallet Details</h2>

      <div style={{ marginBottom: 8 }}>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>

      <div><strong>Account:</strong> {account ?? "Not connected"}</div>
      <div><strong>Balance:</strong> {balance ?? "-"}</div>
      <div><strong>Network:</strong> {network ?? "-"}</div>
      <div><strong>Error:</strong> {error ?? "None"}</div>

      <div style={{ margin: 10 }}>
        <h3>Roles</h3>
        <div><strong>Admin:</strong> {isAdmin ? "Yes" : "No"}</div>
        <div><strong>Manufacturer:</strong> {isManufacturer ? "Yes" : "No"}</div>
        <div><strong>Retailer:</strong> {isRetailer ? "Yes" : "No"}</div>
        <div><strong>Consumer:</strong> {isConsumer ? "Yes" : "No"}</div>
      </div>
    </div>
  );
}
