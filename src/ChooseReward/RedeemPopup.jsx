import React, { useState } from "react";
import "./RedeemPopup.css";
import RedeemDetailsPopup from "./RedeemDetailsPopup";

const RedeemPopup = ({ brand, onClose, truvishCode, phone }) => {
  if (!brand) return null;

  const [voucherDetails, setVoucherDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = Array.isArray(brand.redemptionProcess)
    ? brand.redemptionProcess
    : brand.redemptionProcess?.split(/\r?\n|,/).filter(Boolean);

  const handleRedeem = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        code: truvishCode,
        phone: phone,
        inventoryId: brand.inventoryId,
        selectedValue: brand.selectedValue    // ⭐ send selected value
      });

      const res = await fetch(
        `http://localhost:8080/api/redeem?${params.toString()}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const text = await res.text();
      const data = JSON.parse(text);

      // ⭐ FINAL FIX — Attach selected value into popup data
      setVoucherDetails({
        ...data,
        selectedValue: brand.selectedValue
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
          <button className="popup-close" onClick={onClose}>✕</button>

          <h3>How to redeem this voucher</h3>

          <div className="voucher-box">
            <img
              src={brand.inventoryVoucherLogoUrl}
              alt={brand.inventoryVoucherName}
            />

            <h4>{brand.inventoryVoucherName}</h4>

            <div className="voucher-separator">
              <span className="cut left"></span>
              <span className="dashed-line"></span>
              <span className="cut right"></span>
            </div>

            {/* ⭐ Show the selected value here */}
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
              {steps?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Final Popup */}
      <RedeemDetailsPopup
        voucher={voucherDetails}
        onClose={() => setVoucherDetails(null)}
      />
    </>
  );
};

export default RedeemPopup;
