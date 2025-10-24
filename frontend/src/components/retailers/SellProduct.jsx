import React, { useMemo, useRef, useState } from "react";
import { isAddress } from "ethers";
import { Html5Qrcode } from "html5-qrcode";
import { useContractContext } from "../../context/ContractContext";

// Retailer tool to mark a product as sold
// Uses contract.markAsSold(productId, buyer, storeLocation)
const SellProduct = () => {
	const { contract, account, isRetailer, network } = useContractContext();

	const [productId, setProductId] = useState("");
	const [buyer, setBuyer] = useState(""); // optional; can be left blank for zero address
	const [location, setLocation] = useState("");

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const qrContainerId = useRef(`qr-reader-file-${Math.random().toString(36).slice(2)}`);

	const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

	const fieldsValid = useMemo(() => {
		if (!productId.trim()) return false;
		if (!location.trim()) return false;
		if (buyer.trim() && !isAddress(buyer.trim())) return false;
		return true;
	}, [productId, location, buyer]);

	const canSubmit = !!contract && !!account && isRetailer && fieldsValid && !submitting;

	const onSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		if (!canSubmit) return;

		try {
			setSubmitting(true);
			const buyerAddr = buyer.trim() ? buyer.trim() : ZERO_ADDRESS;
			const tx = await contract.markAsSold(productId.trim(), buyerAddr, location.trim());
			const receipt = await tx.wait();
			if (receipt?.status === 1) {
				setSuccess(`Marked as sold: ${productId.trim()}`);
				setProductId("");
				setBuyer("");
				setLocation("");
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

	// Decode a QR image using html5-qrcode (file upload only, no camera)
	const onUploadQr = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setError("");
		try {
			const html5QrCode = new Html5Qrcode(qrContainerId.current);
			const decodedText = await html5QrCode.scanFile(file, true);
			setProductId(String(decodedText));
		} catch (err) {
			const msg = err?.message || "Could not decode QR from the selected image.";
			setError(msg);
		} finally {
			e.target.value = ""; // allow re-uploading same file
		}
	};

	return (
		<div className="card" style={{ maxWidth: 720 }}>
			<h3 style={{ marginBottom: 12 }}>Sell Product</h3>
			<form onSubmit={onSubmit}>
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					<label htmlFor="pid">Product ID</label>
					<input
						id="pid"
						type="text"
						placeholder="Enter product ID or upload QR"
						value={productId}
						onChange={(e) => setProductId(e.target.value)}
						style={{ padding: 8 }}
					/>

					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<label htmlFor="qrUpload" style={{ fontSize: 14 }}>or upload QR image</label>
						<input id="qrUpload" type="file" accept="image/*" onChange={onUploadQr} />
					</div>

					<label htmlFor="buyer">Buyer Address (optional)</label>
					<input
						id="buyer"
						type="text"
						placeholder="0x... (leave blank if unknown)"
						value={buyer}
						onChange={(e) => setBuyer(e.target.value)}
						style={{ padding: 8 }}
					/>
					{buyer.trim() && !isAddress(buyer.trim()) && (
						<small style={{ color: "#b22" }}>Enter a valid Ethereum address or leave blank.</small>
					)}

					<label htmlFor="location">Store Location</label>
					<input
						id="location"
						type="text"
						placeholder="Store/Location identifier"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						style={{ padding: 8 }}
					/>

					{!isRetailer && (
						<small style={{ color: "#b22" }}>Only authorized retailers can mark products as sold.</small>
					)}

					{!fieldsValid && (
						<small style={{ color: "#b22" }}>Please fill required fields (Product ID and Location) and check Buyer address.</small>
					)}

					<button type="submit" disabled={!canSubmit} style={{ padding: 10 }}>
						{submitting ? "Submitting..." : "Mark as Sold"}
					</button>
				</div>
			</form>

			{error && <div style={{ marginTop: 10, color: "#b22" }}>{error}</div>}
			{success && <div style={{ marginTop: 10, color: "#2a7" }}>{success}</div>}

			<div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
				<div>Network: {network || "unknown"}</div>
				<div>Connected as: {account || "–"}</div>
			</div>

			{/* Hidden container required by html5-qrcode even for file scans */}
			<div id={qrContainerId.current} style={{ display: 'none' }} />
		</div>
	);
};

export default SellProduct;

