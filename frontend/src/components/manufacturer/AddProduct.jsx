import React, { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { useContractContext } from "../../context/ContractContext";

// Minimal form to create a product via ProductVerifier.createProduct
const AddProduct = () => {
	const { contract, account, isManufacturer, network } = useContractContext();

	const [productId, setProductId] = useState("");
	const [batchNumber, setBatchNumber] = useState("");
	const [category, setCategory] = useState("");
	const [productDetails, setProductDetails] = useState("");

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [dbNote, setDbNote] = useState("");

	const fieldsValid =
		productId.trim() && batchNumber.trim() && category.trim() && productDetails.trim();

	const canSubmit = !!contract && !!account && isManufacturer && fieldsValid && !submitting;

	const onSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		if (!canSubmit) return;

		try {
			setSubmitting(true);
			const tx = await contract.createProduct(
				productId.trim(),
				batchNumber.trim(),
				category.trim(),
				productDetails.trim()
			);
			const receipt = await tx.wait();
			if (receipt?.status === 1) {
				setSuccess(`Product created on-chain: ${productId.trim()}`);
				// Also persist to your backend (MongoDB) via REST API
				try {
					const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:5000";
					const res = await fetch(`${API_BASE}/api/products`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							uid: productId.trim(),
							manufacturer: account,
							details: productDetails.trim(),
							// You can include these if your API accepts them:
							// batchNumber: batchNumber.trim(),
							// category: category.trim(),
						}),
					});
					if (res.ok) {
						setDbNote("Saved to database.");
					} else {
						const txt = await res.text().catch(() => "");
						setDbNote(`Database save failed${txt ? `: ${txt}` : "."}`);
					}
				} catch (dbErr) {
					setDbNote(`Database save failed: ${dbErr?.message || "network error"}`);
				}
				setProductId("");
				setBatchNumber("");
				setCategory("");
				setProductDetails("");
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

	useEffect(() => {
		// Only prefill if empty so user overrides aren’t clobbered
		if (!batchNumber) setBatchNumber(makeBatchNumber(account));
	}, [account]); // keep batchNumber in your state

	function makeBatchNumber(manufacturer) {
		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		const addr4 = (manufacturer || "").slice(2, 6).toUpperCase().padEnd(4, "X");
		const rand4 = Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, "0");
		return `BATCH-${yyyy}${mm}${dd}-${addr4}-${rand4}`;
	}

	return (
		<div className="card" style={{ maxWidth: 600 }}>
			<h3 style={{ marginBottom: 12 }}>Create Product</h3>
			<form onSubmit={onSubmit}>
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					<label htmlFor="productId">Product ID</label>
					<input
						id="productId"
						type="text"
						placeholder="SKU-12345"
						value={productId}
						onChange={(e) => setProductId(e.target.value)}
						style={{ padding: 8 }}
					/>

					{productId.trim() && (
						<CenteredQR
							value={productId.trim()}
							fileName={`product-${productId.trim()}-qr.svg`}
						/>
					)}

					<label htmlFor="batchNumber">Batch Number</label>
					<input
						id="batchNumber"
						type="text"
						placeholder="BATCH-001"
						value={batchNumber}
						onChange={(e) => setBatchNumber(e.target.value)}
						style={{ padding: 8 }}
					/>

					<label htmlFor="category">Category</label>
					<input
						id="category"
						type="text"
						placeholder="Electronics"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						style={{ padding: 8 }}
					/>

					<label htmlFor="productDetails">Product Details (used for on-chain hash)</label>
					<textarea
						id="productDetails"
						placeholder="Model X, Color Black, Size M..."
						rows={4}
						value={productDetails}
						onChange={(e) => setProductDetails(e.target.value)}
						style={{ padding: 8 }}
					/>

					{!isManufacturer && (
						<small style={{ color: "#b22" }}>
							Only authorized manufacturers can create products.
						</small>
					)}

					{!fieldsValid && (
						<small style={{ color: "#b22" }}>
							Please fill in all fields before submitting.
						</small>
					)}

					<button type="submit" disabled={!canSubmit} style={{ padding: 10 }}>
						{submitting ? "Creating..." : "Create Product"}
					</button>
				</div>
			</form>

			{error && (
				<div style={{ marginTop: 10, color: "#b22" }}>{error}</div>
			)}
			{success && (
				<div style={{ marginTop: 10, color: "#2a7" }}>{success}</div>
			)}
			{dbNote && (
				<div style={{ marginTop: 6, color: dbNote.startsWith("Saved") ? "#2a7" : "#b8860b" }}>{dbNote}</div>
			)}

			<div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
				<div>Network: {network || "unknown"}</div>
				<div>Connected as: {account || "–"}</div>
			</div>
		</div>
	);
};

export default AddProduct;

// Internal helper component to center and download QR as SVG
const CenteredQR = ({ value, fileName }) => {
	const qrRef = useRef(null);

	const downloadSvg = () => {
		const container = qrRef.current;
		if (!container) return;
		const svg = container.querySelector('svg');
		if (!svg) return;

		const serializer = new XMLSerializer();
		let source = serializer.serializeToString(svg);
		if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
			source = source.replace(
				/^<svg/,
				'<svg xmlns="http://www.w3.org/2000/svg"'
			);
		}
		source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

		const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName || 'qr.svg';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
			<div
				ref={qrRef}
				style={{
					marginTop: 8,
					padding: 12,
					border: '1px solid #eee',
					background: '#fff',
				}}
			>
				<div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Product ID QR</div>
				<QRCode value={value} size={156} />
			</div>
			<button type="button" onClick={downloadSvg} style={{ padding: 8 }}>
				Download QR (SVG)
			</button>
		</div>
	);
};

