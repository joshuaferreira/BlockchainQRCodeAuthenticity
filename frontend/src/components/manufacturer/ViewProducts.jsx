import React, { useEffect, useMemo, useState } from "react";
import { isAddress, toBigInt, getAddress } from "ethers";
import { useContractContext } from "../../context/ContractContext";

// List all products made by a manufacturer
// Source options:
// - Backend: GET {API}/api/products/manufacturer/:address
// - On-chain: scan ProductCreated events filtered by manufacturer, then fetch details
const ViewProducts = () => {
	const { contract, account, network } = useContractContext();

	const [manufacturer, setManufacturer] = useState("");
	const [source, setSource] = useState("backend"); // "backend" | "onchain"
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [items, setItems] = useState([]);

	const API_BASE = useMemo(() => {
		// Prefer VITE_API_URL if configured, else default to local dev
		return import.meta?.env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
	}, []);

	// Prefill manufacturer with current account on mount/change
	useEffect(() => {
		if (account && !manufacturer) setManufacturer(account);
	}, [account]);

	const canFetch = useMemo(() => {
		return (!loading) && isAddressSafe(manufacturer) && ((source === "backend") || (!!contract));
	}, [loading, manufacturer, source, contract]);

	function isAddressSafe(addr) {
		try {
			return !!addr && isAddress(addr);
		} catch {
			return false;
		}
	}

	const dateLabel = (v) => {
		if (!v) return "—";
		// Support both epoch seconds (number) and ISO strings
		const num = Number(v);
		const d = Number.isFinite(num) && String(v) === String(num)
			? new Date(num * (num < 1e12 ? 1000 : 1)) // seconds vs ms heuristic
			: new Date(v);
		return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
	};

	async function fetchFromBackend(addr) {
		const url = `${API_BASE}/api/products/manufacturer/${addr}`;
		const res = await fetch(url, { headers: { "Accept": "application/json" } });
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Backend ${res.status}: ${text || res.statusText}`);
		}
		const data = await res.json();
		// Try common response shapes: array | {products: []} | {data: []} | {result: []} | {items: []} | {docs: []}
		let list = Array.isArray(data) ? data
			: Array.isArray(data?.products) ? data.products
			: Array.isArray(data?.data) ? data.data
			: Array.isArray(data?.result) ? data.result
			: Array.isArray(data?.items) ? data.items
			: Array.isArray(data?.docs) ? data.docs
			: [];

		// Last-resort fallback: pick the first array value in the object
		if (!Array.isArray(list) || list.length === 0) {
			const firstArray = Object.values(data || {}).find((v) => Array.isArray(v));
			if (Array.isArray(firstArray)) list = firstArray;
		}

		return (list || []).map((d) => ({
			productId: d?.uid || d?.productId || d?.id || d?._id || "",
			manufacturer: d?.manufacturer || addr,
			details: d?.details ?? "—",
			manufactureDate: d?.createdAt || d?.manufactureDate || d?.timestamp || "",
			status: d?.status, // backend schema doesn't include status; may remain undefined
		}));
	}

	async function fetchFromOnchain(addr) {
		if (!contract) throw new Error("Contract not ready");
		// Query ProductCreated events where manufacturer == addr
		// Note: This scans from block 0; for large chains consider narrowing the range.
		const filter = contract.filters?.ProductCreated?.(null, addr);
		const logs = await contract.queryFilter(filter, 0, "latest");
        console.log("On-chain fetched logs:", logs);
        
        const productId = toBigInt(logs[0].topics[1]).toString();
        const manufacturer = getAddress("0x" + logs[0].topics[2].slice(26));
        
        console.log("Decoded productId:", productId, "manufacturer:", manufacturer);

		const ids = logs.map(l => l.args?.productId ?? l.args?.[0]).filter(Boolean);
		// Deduplicate IDs in case of reorg/duplicates
		const uniqueIds = Array.from(new Set(ids));
		// Fetch details for each id in parallel
		const details = await Promise.all(uniqueIds.map(async (pid) => {
			try {
				const [exists, manufacturer, manufactureDate, batchNumber, category, status] = await contract.getProductDetails(pid);
				if (!exists) return null;
				return {
					productId: pid,
					manufacturer,
					manufactureDate: Number(manufactureDate),
					batchNumber,
					category,
					status: Number(status),
				};
			} catch {
				return null;
			}
		}));
		return details.filter(Boolean);
	}

	const fetchProducts = async (e) => {
		e?.preventDefault?.();
		setError("");
		setItems([]);
		if (!canFetch) return;
		try {
			setLoading(true);
			const addr = manufacturer.trim();
			const list = source === "backend" ? await fetchFromBackend(addr) : await fetchFromOnchain(addr);
            console.log("Fetched products list:", list);
			// Sort newest first (by manufactureDate if available)
			list.sort((a, b) => (Number(b.manufactureDate || 0) - Number(a.manufactureDate || 0)));
			setItems(list);
		} catch (err) {
			const msg = err?.shortMessage || err?.info?.error?.message || err?.message || "Failed to fetch products";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card" style={{ maxWidth: 900 }}>
			<h3 style={{ marginBottom: 12 }}>View Products by Manufacturer</h3>
			<form onSubmit={fetchProducts} style={{ marginBottom: 12 }}>
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					<label htmlFor="maddr">Manufacturer Address</label>
					<input
						id="maddr"
						type="text"
						placeholder="0x..."
						value={manufacturer}
						onChange={(e) => setManufacturer(e.target.value)}
						style={{ padding: 8 }}
					/>

					<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
						<label><input type="radio" name="source" value="backend" checked={source === "backend"} onChange={() => setSource("backend")} /> Backend</label>
						<label><input type="radio" name="source" value="onchain" checked={source === "onchain"} onChange={() => setSource("onchain")} disabled/> On-chain</label>
					</div>

					<button type="submit" disabled={!canFetch} style={{ padding: 10 }}>
						{loading ? "Loading..." : "Fetch Products"}
					</button>
				</div>
			</form>

			{error && <div style={{ marginTop: 8, color: "#b22" }}>{error}</div>}

			{items.length > 0 && (
				<div style={{ marginTop: 12 }}>
					<div style={{ marginBottom: 8, color: "#555" }}>Found {items.length} product(s)</div>
					<div style={{ overflowX: "auto" }}>
						<table style={{ width: "100%", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
									<th style={{ padding: 8 }}>Product ID</th>
									<th style={{ padding: 8 }}>Details</th>
									<th style={{ padding: 8 }}>Status</th>
									<th style={{ padding: 8 }}>Manufacturer</th>
									<th style={{ padding: 8 }}>Created</th>
								</tr>
							</thead>
							<tbody>
								{items.map((it) => (
									<tr key={it.productId} style={{ borderBottom: "1px solid #f2f2f2" }}>
										<td style={{ padding: 8, fontFamily: "monospace" }}>{it.productId}</td>
										<td style={{ padding: 8 }}>{it.details || "—"}</td>
										<td style={{ padding: 8 }}>{it.status === 1 ? "Sold" : it.status === 0 ? "Available" : (it.status ?? "—")}</td>
										<td style={{ padding: 8, fontFamily: "monospace" }}>{it.manufacturer}</td>
										<td style={{ padding: 8 }}>{dateLabel(it.manufactureDate)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
				<div>Network: {network || "unknown"}</div>
				<div>Connected as: {account || "–"}</div>
			</div>
		</div>
	);
};

export default ViewProducts;

