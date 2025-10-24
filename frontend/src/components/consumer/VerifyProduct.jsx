import React, { useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import { Html5Qrcode } from "html5-qrcode";
import { useContractContext } from "../../context/ContractContext";

// Helper to format timestamps
const fmtDateTime = (ts) => (ts ? new Date(Number(ts) * 1000).toLocaleString() : "—");
const statusLabel = (s) => (s === 1 ? "Sold" : s === 0 ? "Available" : String(s));

// Robust getter for productHash from the public mapping return
const getProductHash = (prodTuple) => {
  if (!prodTuple) return undefined;
  // Ethers v6 returns an array-like object with named props when possible
  return (
    prodTuple.productHash || // named property
    prodTuple[5] || // index in struct layout
    undefined
  );
};

const VerifyProduct = () => {
  const { contract, account, network } = useContractContext();
  const qrContainerId = useRef(
    `qr-reader-file-${Math.random().toString(36).slice(2)}`
  );

  const [productId, setProductId] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);
  const [coords, setCoords] = useState(null); // [lon, lat]
  const [locError, setLocError] = useState("");
  const [deviceInfo, setDeviceInfo] = useState({ userAgent: "", platform: "" });
  const [scanPayload, setScanPayload] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postStatus, setPostStatus] = useState(null); // HTTP status code
  const [postResponse, setPostResponse] = useState(null); // parsed response body
  /* result shape:
    {
      productId,
      exists, status, manufacturer, batchNumber,
      isTrustedManufacturer,
      detailsProvided,
      detailsMatch,
      onchainHash,
      localHash,
      sale: { wasSold, retailer, saleDate, location, retailerTrusted } | null,
      verdict: boolean,
      reasons: string[]
    }
  */

  const canVerify = useMemo(
    () => !!contract && productId.trim().length > 0 && !loading,
    [contract, productId, loading]
  );

  const resetOutputs = () => {
    setError("");
    setResult(null);
    setScanPayload(null);
  };

  // Acquire extras: geolocation (lon,lat) and device info
  const getExtras = async () => {
    setLocError("");
    // Device info
    try {
      setDeviceInfo({
        userAgent: navigator?.userAgent || "",
        platform: navigator?.platform || "",
      });
    } catch (_) {
      // ignore
    }

    // Geolocation (optional)
    if ("geolocation" in navigator) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lon = Number(pos?.coords?.longitude);
            const lat = Number(pos?.coords?.latitude);
            if (Number.isFinite(lon) && Number.isFinite(lat)) {
              setCoords([lon, lat]);
            } else {
              setCoords(null);
            }
            resolve();
          },
          (err) => {
            setLocError(err?.message || "Failed to get location");
            setCoords(null);
            resolve();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      });
    } else {
      setLocError("Geolocation not supported by this browser/device");
    }
  };

  const onUploadQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetOutputs();
    try {
      const html5QrCode = new Html5Qrcode(qrContainerId.current);
      const decodedText = await html5QrCode.scanFile(file, true);

      // Try to parse JSON payload first: { productId, details }
      try {
        const obj = JSON.parse(decodedText);
        if (obj && typeof obj === "object") {
          if (obj.productId) setProductId(String(obj.productId));
          if (obj.details) setDetails(String(obj.details));
          return;
        }
      } catch (_) {
        // not JSON, ignore
      }

      // Fallback: assume plain string contains productId
      setProductId(String(decodedText));
    } catch (err) {
      const msg =
        err?.message || "Could not decode QR from the selected image.";
      setError(msg);
    } finally {
      // reset input so same file can be uploaded again
      e.target.value = "";
    }
  };

  const verify = async (e) => {
    e?.preventDefault?.();
    resetOutputs();
    if (!canVerify) return;

    const pid = productId.trim();
    const detailsString = details; // may be empty; we'll reflect that in output

    try {
      setLoading(true);

      // 1) quick existence + status + manufacturer + batch
      const [exists, status, manufacturer, batchNumber] =
        await contract.quickVerify(pid);

      const base = {
        productId: pid,
        exists,
        status: Number(status),
        manufacturer,
        batchNumber,
        isTrustedManufacturer: false,
        detailsProvided: detailsString.trim().length > 0,
        detailsMatch: false,
        onchainHash: null,
        localHash: null,
        sale: null,
        verdict: false,
        reasons: [],
      };

      if (!exists) {
        base.reasons.push("Product not found on-chain");
        setResult(base);
        return;
      }

      // 2) manufacturer authorization
      let isTrustedManufacturer = false;
      try {
        isTrustedManufacturer = await contract.authorizedManufacturers(
          manufacturer
        );
      } catch (inner) {
        base.reasons.push(
          inner?.shortMessage || inner?.message || "Failed to check manufacturer authorization"
        );
      }
      base.isTrustedManufacturer = !!isTrustedManufacturer;
      if (!isTrustedManufacturer) {
        base.reasons.push("Manufacturer not in trusted list");
      }

      // 3) integrity via hash
      try {
        const prodTuple = await contract.products(pid);
        const onchainHash = getProductHash(prodTuple);
        base.onchainHash = onchainHash || null;

        if (base.detailsProvided && onchainHash) {
          const localHash = ethers.id(detailsString);
          base.localHash = localHash;
          base.detailsMatch =
            String(localHash).toLowerCase() === String(onchainHash).toLowerCase();
          if (!base.detailsMatch) {
            base.reasons.push("Details do not match on-chain fingerprint");
          }
        } else if (!base.detailsProvided) {
          base.reasons.push("No details provided to verify fingerprint");
        }
      } catch (inner) {
        base.reasons.push(
          inner?.shortMessage || inner?.message || "Failed to fetch product hash"
        );
      }

      // 4) sale checks if sold
      if (base.status === 1) {
        try {
          const [wasSold, retailer, saleDate, location] =
            await contract.getSaleInfo(pid);
          let retailerTrusted = false;
          if (wasSold) {
            try {
              retailerTrusted = await contract.authorizedRetailers(retailer);
              if (!retailerTrusted) {
                base.reasons.push("Sale retailer not authorized");
              }
            } catch (rerr) {
              base.reasons.push(
                rerr?.shortMessage || rerr?.message || "Failed to check retailer authorization"
              );
            }
          } else {
            base.reasons.push("Marked sold but no sale record found");
          }
          base.sale = {
            wasSold,
            retailer,
            saleDate: Number(saleDate),
            location,
            retailerTrusted,
          };
        } catch (inner) {
          base.reasons.push(
            inner?.shortMessage || inner?.message || "Failed to fetch sale info"
          );
        }
      }

      // 5) verdict
      base.verdict =
        base.isTrustedManufacturer &&
        (base.detailsProvided ? base.detailsMatch : true) &&
        (base.status === 0 || (base.sale && base.sale.wasSold && base.sale.retailerTrusted));

      setResult(base);

      console.log("Verification result:", base);


      // Build scan payload expected by backend (latitude/longitude top-level, not a GeoJSON object)
      function toScanLogPayload(base, extras = {}) {
        const { coords, userAgent, platform } = extras;

        // Decide scanResult
        let scanResult;
        if (!base?.exists) {
          scanResult = 'NOT_FOUND';
        } else if (base?.verdict === true && Number(base.status) === 1 && base?.sale?.wasSold) {
          scanResult = 'ALREADY_SOLD';
        } else if (base?.verdict === true) {
          scanResult = 'AUTHENTIC';
        } else {
          // Fallback: treat unverifiable as NOT_FOUND (enum has no COUNTERFEIT)
          scanResult = 'NOT_FOUND';
        }

        const statusStr = Number(base?.status) === 1 ? 'Sold' : 'Available';

        const payload = {
          productId: base?.productId,
          scanResult,
          // Flatten geolocation to latitude/longitude fields when available
          ...(Array.isArray(coords) && coords.length === 2
            ? { longitude: Number(coords[0]), latitude: Number(coords[1]) }
            : {}),
          // Use sale.retailer for address if a sale exists
          ...(base?.sale?.retailer ? { address: base.sale.retailer } : {}),
          blockchainData: {
            manufacturer: base?.manufacturer || '',
            batchNumber: base?.batchNumber || '',
            status: statusStr,
          },
        };

        if (userAgent || platform) {
          payload.deviceInfo = {
            ...(userAgent ? { userAgent } : {}),
            ...(platform ? { platform } : {}),
          };
        }

        return payload;
      }

        // Build optional extras and create a scan payload preview
        const extras = {
          coords: Array.isArray(coords) && coords.length === 2 ? coords : undefined,
          userAgent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
        };

        const payload = toScanLogPayload(base, extras);
        setScanPayload(payload);
        console.log("ScanLog payload:", payload);

        // Auto-send to backend; if you prefer manual, comment this out and use the button below
        await postScanPayload(payload);

    } catch (e2) {
      const msg =
        e2?.shortMessage || e2?.info?.error?.message || e2?.message || "Verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const postScanPayload = async (payload) => {
    setPostError("");
    setPostStatus(null);
    setPostResponse(null);
    setPosting(true);
    try {
      const res = await fetch("http://localhost:5000/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      setPostStatus(res.status);
      let data = null;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch (_) {
        data = text || null;
      }
      setPostResponse(data);
      if (!res.ok) {
        throw new Error((data && (data.message || data.error)) || `Request failed with ${res.status}`);
      }
    } catch (err) {
      setPostError(err?.message || "Failed to POST scan payload");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 820 }}>
      <h3 style={{ marginBottom: 12 }}>Verify Product Authenticity</h3>

      <form onSubmit={verify}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label htmlFor="qrUpload" style={{ fontSize: 14 }}>
              or upload QR image
            </label>
            <input
              id="qrUpload"
              type="file"
              accept="image/*"
              onChange={onUploadQr}
            />
          </div>

          <label htmlFor="details">Product Details (exact string used when created)</label>
          <textarea
            id="details"
            placeholder="Paste the canonical details string or JSON used to create the product"
            rows={6}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            style={{ padding: 8, fontFamily: "monospace" }}
          />

          <button type="submit" disabled={!canVerify} style={{ padding: 10 }}>
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button type="button" onClick={getExtras} style={{ padding: 10 }}>
            Get extras (location + device)
          </button>
        </div>
      </form>

      {/* Hidden container required by html5-qrcode even for file scans */}
      <div id={qrContainerId.current} style={{ display: "none" }} />

      {error && <div style={{ marginTop: 10, color: "#b22" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 5,
                background: result.verdict ? "#2e7d32" : "#c62828",
              }}
            />
            <strong>
              {result.verdict ? "Authentic" : "Not authentic"}
            </strong>
          </div>

          <div style={{ marginBottom: 6 }}>
            <strong>Status:</strong> {statusLabel(result.status)}
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Manufacturer:</strong> {result.manufacturer}
            {" "}
            <span style={{ color: result.isTrustedManufacturer ? "#2e7d32" : "#c62828" }}>
              ({result.isTrustedManufacturer ? "trusted" : "untrusted"})
            </span>
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Batch:</strong> {result.batchNumber}
          </div>

          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #ddd" }}>
            <strong>Integrity Check</strong>
            <div style={{ marginTop: 6 }}>
              <div><strong>Details provided:</strong> {result.detailsProvided ? "Yes" : "No"}</div>
              <div><strong>On-chain hash:</strong> {result.onchainHash || "—"}</div>
              <div><strong>Local hash:</strong> {result.localHash || (result.detailsProvided ? "(computed later)" : "—")}</div>
              {result.detailsProvided && (
                <div>
                  <strong>Match:</strong>{" "}
                  <span style={{ color: result.detailsMatch ? "#2e7d32" : "#c62828" }}>
                    {result.detailsMatch ? "Yes" : "No"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {result.status === 1 && result.sale && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #ddd" }}>
              <strong>Sale</strong>
              <div style={{ marginTop: 6 }}>
                <div><strong>Retailer:</strong> {result.sale.retailer}{" "}
                  <span style={{ color: result.sale.retailerTrusted ? "#2e7d32" : "#c62828" }}>
                    ({result.sale.retailerTrusted ? "trusted" : "untrusted"})
                  </span>
                </div>
                <div><strong>When:</strong> {fmtDateTime(result.sale.saleDate)}</div>
                <div><strong>Location:</strong> {result.sale.location || "—"}</div>
              </div>
            </div>
          )}

          {result.reasons.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #ddd" }}>
              <strong>Notes</strong>
              <ul style={{ marginTop: 6 }}>
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            <div>Network: {network || "unknown"}</div>
            <div>Connected as: {account || "–"}</div>
          </div>
        </div>
      )}

      {/* Extras & Payload Preview */}
      <div style={{ marginTop: 12, padding: 12, border: "1px dashed #ddd" }}>
        <strong>Extras</strong>
        <div style={{ marginTop: 6 }}>
          <div><strong>Longitude</strong>: {coords ? String(coords[0]) : "—"}</div>
          <div><strong>Latitude</strong>: {coords ? String(coords[1]) : "—"}</div>
          {locError && (
            <div style={{ color: "#b22" }}>
              Location error: {locError}
            </div>
          )}
          <div><strong>User agent</strong>: {deviceInfo.userAgent || "—"}</div>
          <div><strong>Platform</strong>: {deviceInfo.platform || "—"}</div>
        </div>

        {scanPayload && (
          <div style={{ marginTop: 10 }}>
            <strong>Scan Log Payload (preview)</strong>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
{JSON.stringify(scanPayload, null, 2)}
            </pre>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
              <button type="button" onClick={() => postScanPayload(scanPayload)} disabled={posting}>
                {posting ? "Sending..." : "Send to backend"}
              </button>
              {postStatus && (
                <span>HTTP {postStatus}</span>
              )}
            </div>
            {(postError || postResponse) && (
              <div style={{ marginTop: 8 }}>
                {postError && (
                  <div style={{ color: "#b22" }}>POST error: {postError}</div>
                )}
                {postResponse && (
                  <>
                    <div><strong>Response</strong></div>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
{typeof postResponse === 'string' ? postResponse : JSON.stringify(postResponse, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyProduct;
