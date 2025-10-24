import React, { useMemo, useState } from "react";
import { isAddress } from "ethers";
import { useContractContext } from "../../context/ContractContext";

// Admin tool to authorize a retailer address
const MakeRetailer = () => {
  const { contract, account, isAdmin, network } = useContractContext();

  const [inputAddr, setInputAddr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const normalized = useMemo(() => inputAddr.trim(), [inputAddr]);
  const addressValid = useMemo(() => {
    if (!isAddress(normalized)) return false;
    return normalized.toLowerCase() !== ZERO_ADDRESS.toLowerCase();
  }, [normalized]);

  const canSubmit = !!contract && !!account && isAdmin && addressValid && !submitting;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      const tx = await contract.authorizeRetailer(normalized);
      const receipt = await tx.wait();
      if (receipt?.status === 1) {
        setSuccess(`Authorized retailer: ${normalized}`);
        setInputAddr("");
      } else {
        setError("Transaction failed or was reverted");
      }
    } catch (e) {
      const msg = e?.shortMessage || e?.info?.error?.message || e?.message || "Unknown error";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h3 style={{ marginBottom: 12 }}>Authorize Retailer</h3>
      <form onSubmit={onSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="retailerAddress">Retailer Address</label>
          <input
            id="retailerAddress"
            type="text"
            placeholder="0x..."
            value={inputAddr}
            onChange={(e) => setInputAddr(e.target.value)}
            style={{ padding: 8 }}
          />

          {!addressValid && normalized && (
            <small style={{ color: "#b22" }}>Enter a valid, non-zero Ethereum address.</small>
          )}

          {!isAdmin && (
            <small style={{ color: "#b22" }}>Only the contract owner/admin can authorize retailers.</small>
          )}

          <button type="submit" disabled={!canSubmit} style={{ padding: 10 }}>
            {submitting ? "Authorizing..." : "Authorize"}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ marginTop: 10, color: "#b22" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginTop: 10, color: "#2a7" }}>
          {success}
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        <div>Network: {network || "unknown"}</div>
        <div>Connected as: {account || "–"}</div>
      </div>
    </div>
  );
};

export default MakeRetailer;
