import React, { useMemo, useState } from "react";
import "./RedeemDetailsPopup.css";
import { FaRegCopy } from "react-icons/fa6";

const RedeemDetailsPopup = ({ voucher, onClose }) => {
  const [copiedField, setCopiedField] = useState("");

  const steps = useMemo(() => {
    if (!voucher) return [];

    if (Array.isArray(voucher.redemptionProcess)) {
      return voucher.redemptionProcess.filter(Boolean);
    }

    return String(voucher.redemptionProcess || "")
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [voucher]);

  const safeUrl = (url) => {
    if (!url) return "";
    return String(url).trim();
  };

  const handleCopy = async (field, value) => {
    if (!value || value === "-") return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(field);

      setTimeout(() => {
        setCopiedField("");
      }, 1200);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Copy failed");
    }
  };

  if (!voucher) return null;

  const voucherNumber = voucher.voucher || "-";
  const voucherPin = voucher.pin || "-";

  return (
    <div className="popup-overlay details-overlay">
      <div className="popup-card">
        <button className="popup-close" onClick={onClose} type="button">
          ✕
        </button>

        <h3>Your voucher is ready</h3>

        <div className="voucher-box">
          {voucher.inventoryVoucherLogoUrl ? (
            <img
              src={voucher.inventoryVoucherLogoUrl}
              alt={voucher.inventoryVoucherName || voucher.brandName || "Brand"}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          <h4>{voucher.inventoryVoucherName || voucher.brandName || "-"}</h4>

          <div className="voucher-separator">
            <span className="cut left"></span>
            <span className="dashed-line"></span>
            <span className="cut right"></span>
          </div>

          <div className="amount">
            INR {voucher.selectedValue || voucher.redeemedValue || 0}
          </div>

          <div className="code-box">
            <div>
              <label>Gift Card / Voucher Number</label>

              <div className="copy-value-row">
                <span>{voucherNumber}</span>

                <button
                  type="button"
                  className={`copy-icon-btn ${
                    copiedField === "voucher" ? "copied" : ""
                  }`}
                  onClick={() => handleCopy("voucher", voucherNumber)}
                  disabled={!voucherNumber || voucherNumber === "-"}
                  aria-label="Copy voucher number"
                  title={copiedField === "voucher" ? "Copied" : "Copy"}
                >
                  <FaRegCopy />
                </button>
              </div>
            </div>

            <div>
              <label>Code / PIN</label>

              <div className="copy-value-row">
                <span>{voucherPin}</span>

                <button
                  type="button"
                  className={`copy-icon-btn ${
                    copiedField === "pin" ? "copied" : ""
                  }`}
                  onClick={() => handleCopy("pin", voucherPin)}
                  disabled={!voucherPin || voucherPin === "-"}
                  aria-label="Copy PIN"
                  title={copiedField === "pin" ? "Copied" : "Copy"}
                >
                  <FaRegCopy />
                </button>
              </div>
            </div>
          </div>

          {voucher.inventoryVoucherBrandUrl ? (
            <a
              href={safeUrl(voucher.inventoryVoucherBrandUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-btn"
            >
              Shop {voucher.inventoryVoucherName || voucher.brandName || "Brand"} Deals ↗
            </a>
          ) : null}

          <p className="expiry">
            Valid till{" "}
            <span className="expiry-date">{voucher.validityTill || "-"}</span>
          </p>
        </div>

        {steps.length > 0 && (
          <div className="process">
            <h4>Redemption Process</h4>
            <ol>
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemDetailsPopup;