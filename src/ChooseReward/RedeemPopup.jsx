import React, { useState } from "react";
import "./RedeemPopup.css";
import RedeemDetailsPopup from "./RedeemDetailsPopup";

// ✅ Railway Backend URL
const BASE_URL = "https://grateful-warmth-production-b64e.up.railway.app";

const RedeemPopup = ({ brand, onClose, truvishCode, phone }) => {
  const [voucherDetails, setVoucherDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!brand) return null;

  const steps = Array.isArray(brand.redemptionProcess)
    ? brand.redemptionProcess
    : String(brand.redemptionProcess || "")
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);

  // ✅ helper for image url
  const cleanUrl = (url) => {
    if (!url) return "";

    let u = String(url).trim().replace(/['"]/g, "").replace(/ /g, "%20");

    // already full url
    if (u.startsWith("http://") || u.startsWith("https://")) {
      return u;
    }

    // remove starting slash if any
    u = u.replace(/^\/+/, "");

    return `${BASE_URL}/${u}`;
  };

  const handleRedeem = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        code: truvishCode || "",
        phone: phone || "",
        inventoryId: brand.inventoryId,
        selectedValue: brand.selectedValue,
      });

      const res = await fetch(
        `${BASE_URL}/api/redeem?${params.toString()}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Redeem failed");
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      // ✅ selected value popup me bhi rahe
      setVoucherDetails({
        ...data,
        selectedValue: brand.selectedValue,
      });
    } catch (err) {
      alert(err.message || "Redeem failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="popup-overlay">
        <div className="popup-card">
          <button className="popup-close" onClick={onClose}>
            ✕
          </button>

          <h3>How to redeem this voucher</h3>

          <div className="voucher-box">
            <img
              src={cleanUrl(brand.inventoryVoucherLogoUrl)}
              alt={brand.inventoryVoucherName}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />

            <h4>{brand.inventoryVoucherName}</h4>

            <div className="voucher-separator">
              <span className="cut left"></span>
              <span className="dashed-line"></span>
              <span className="cut right"></span>
            </div>

            <div className="amount">
              INR {brand.selectedValue}
            </div>

            <button
              className="redeem-main"
              onClick={handleRedeem}
              disabled={loading}
            >
              {loading ? "Processing..." : "Redeem"}
            </button>
          </div>

          <div className="process">
            <h4>Redemption Process</h4>
            <ol>
              {steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <RedeemDetailsPopup
        voucher={voucherDetails}
        onClose={() => setVoucherDetails(null)}
      />
    </>
  );
};

export default RedeemPopup;