import React from "react";
import "./RedeemDetailsPopup.css";

const RedeemDetailsPopup = ({ voucher, onClose }) => {
  if (!voucher) return null;

  const steps = Array.isArray(voucher.redemptionProcess)
    ? voucher.redemptionProcess
    : voucher.redemptionProcess?.split(/\r?\n|,/).filter(Boolean) || [];

  return (
    <div className="popup-overlay">
      <div className="popup-card">

        <button className="popup-close" onClick={onClose}>✕</button>

        <h3>How to redeem this voucher</h3>

        <div className="voucher-box">

          <img
            src={voucher.inventoryVoucherLogoUrl}
            alt={voucher.inventoryVoucherName}
          />

          <h4>{voucher.inventoryVoucherName}</h4>

          <div className="voucher-separator">
            <span className="cut left"></span>
            <span className="dashed-line"></span>
            <span className="cut right"></span>
          </div>

          {/* ⭐ FINAL FIX — always show the redeemed value */}
          <div className="amount">
            INR {voucher.selectedValue}
          </div>


          <div className="code-box">
            <div>
              <label>Gift Card / Voucher Number</label>
              <span>{voucher.inventoryVoucherNumber}</span>
            </div>

            <div>
              <label>Code / PIN</label>
              <span>{voucher.inventoryVoucherPin}</span>
            </div>
          </div>

          <a
            href={voucher.inventoryVoucherBrandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shop-btn"
          >
            Shop {voucher.inventoryVoucherName} Deals ↗
          </a>

          <p className="expiry">
            Valid till <span className="expiry-date">{voucher.inventoryVoucherExpire}</span>
          </p>
        </div>

        <div className="process">
          <h4>Redemption Process</h4>
          <ol>
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  );
};

export default RedeemDetailsPopup;
