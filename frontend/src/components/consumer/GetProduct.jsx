import React, { useMemo, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useContractContext } from "../../context/ContractContext";

// Consumer tool to fetch on-chain product details by ID
const GetProduct = () => {
		const { contract, account, network } = useContractContext();
		const qrContainerId = useRef(`qr-reader-file-${Math.random().toString(36).slice(2)}`);

	const [productId, setProductId] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [result, setResult] = useState(null);
	const [sale, setSale] = useState(null); // sale details if product is sold

	const canQuery = useMemo(() => !!contract && productId.trim().length > 0 && !loading, [contract, productId, loading]);

	const fetchDetails = async (e) => {
		e?.preventDefault?.();
		setError("");
		setResult(null);
		setSale(null);
		if (!canQuery) return;

		try {
			setLoading(true);
			// getProductDetails returns: (exists, manufacturer, manufactureDate, batchNumber, category, status)
			const [exists, manufacturer, manufactureDate, batchNumber, category, status] = await contract.getProductDetails(productId.trim());
			const normalized = { exists, manufacturer, manufactureDate: Number(manufactureDate), batchNumber, category, status: Number(status) };
			setResult(normalized);

			// If product is sold, fetch sale info as well
			if (normalized.exists && normalized.status === 1) {
				try {
					const [wasSold, retailer, saleDate, location] = await contract.getSaleInfo(productId.trim());
					setSale({ wasSold, retailer, saleDate: Number(saleDate), location });
				} catch (innerErr) {
					// Surface a non-blocking note about sale info fetch
					const imsg = innerErr?.shortMessage || innerErr?.info?.error?.message || innerErr?.message || "Failed to fetch sale info";
					setError((prev) => prev ? prev + " | " + imsg : imsg);
				}
			}
		} catch (e) {
			const msg = e?.shortMessage || e?.info?.error?.message || e?.message || "Failed to fetch product details";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const statusLabel = (s) => (s === 1 ? "Sold" : s === 0 ? "Available" : String(s));
	const dateLabel = (ts) => (ts ? new Date(ts * 1000).toLocaleString() : "—");

		// Decode a QR image using html5-qrcode (file upload only, no camera)
		const onUploadQr = async (e) => {
			const file = e.target.files?.[0];
			if (!file) return;
			setError("");
			try {
				const html5QrCode = new Html5Qrcode(qrContainerId.current);
				const decodedText = await html5QrCode.scanFile(file, true);
				setProductId(String(decodedText));
				// Optionally auto-fetch immediately after decode
				// await fetchDetails();
			} catch (err) {
				const msg = err?.message || "Could not decode QR from the selected image.";
				setError(msg);
			} finally {
				// reset input so same file can be uploaded again
				e.target.value = "";
			}
		};

	return (
		<div className="card" style={{ maxWidth: 720 }}>
			<h3 style={{ marginBottom: 12 }}>Get Product Details</h3>
			<form onSubmit={fetchDetails}>
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					<label htmlFor="pid">Product ID</label>
					<input
						id="pid"
						type="text"
						placeholder="Enter product ID (e.g., SKU-12345)"
						value={productId}
						onChange={(e) => setProductId(e.target.value)}
						style={{ padding: 8 }}
					/>

							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<label htmlFor="qrUpload" style={{ fontSize: 14 }}>or upload QR image</label>
								<input id="qrUpload" type="file" accept="image/*" onChange={onUploadQr} />
							</div>

					<button type="submit" disabled={!canQuery} style={{ padding: 10 }}>
						{loading ? "Fetching..." : "Fetch Details"}
					</button>
				</div>
			</form>

					{/* Hidden container required by html5-qrcode even for file scans */}
					<div id={qrContainerId.current} style={{ display: 'none' }} />

			{error && <div style={{ marginTop: 10, color: "#b22" }}>{error}</div>}

			{result && (
				<div style={{ marginTop: 14, padding: 12, border: "1px solid #eee" }}>
					<div style={{ marginBottom: 8 }}><strong>Exists:</strong> {result.exists ? "Yes" : "No"}</div>
					<div style={{ marginBottom: 8 }}><strong>Status:</strong> {statusLabel(result.status)}</div>
					<div style={{ marginBottom: 8 }}><strong>Manufacturer:</strong> {result.manufacturer}</div>
					<div style={{ marginBottom: 8 }}><strong>Manufacture Date:</strong> {dateLabel(result.manufactureDate)}</div>
					<div style={{ marginBottom: 8 }}><strong>Batch Number:</strong> {result.batchNumber}</div>
					<div style={{ marginBottom: 8 }}><strong>Category:</strong> {result.category}</div>

					{result.status === 1 && (
						<div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #ddd" }}>
							<strong>Sale Details</strong>
							{sale?.wasSold ? (
								<div style={{ marginTop: 8 }}>
									<div style={{ marginBottom: 6 }}><strong>Retailer:</strong> {sale.retailer}</div>
									<div style={{ marginBottom: 6 }}><strong>Sale Date:</strong> {dateLabel(sale.saleDate)}</div>
									<div style={{ marginBottom: 6 }}><strong>Location:</strong> {sale.location}</div>
								</div>
							) : (
								<div style={{ marginTop: 8, color: "#666" }}>No sale record found.</div>
							)}
						</div>
					)}
				</div>
			)}

			<div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
				<div>Network: {network || "unknown"}</div>
				<div>Connected as: {account || "–"}</div>
			</div>
		</div>
	);
};

export default GetProduct;

