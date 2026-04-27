import React, { useMemo, useState } from "react";
import { FaCopy } from "react-icons/fa";
import "./RedemptionHistoryDetailsPopup.css";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://truvish-backend-production.up.railway.app";

const RedemptionHistoryDetailsPopup = ({ item, onClose }) => {
  const [copiedField, setCopiedField] = useState("");

  const getFullUrl = (url, isUpload = false) => {
    if (!url) return "";

    let clean = String(url).trim().replace(/['"]/g, "");
    clean = clean.replace(/\\/g, "/").replace(/ /g, "%20");

    const looksLikeWindowsPath = /^[A-Za-z]:\//.test(clean);

    if (looksLikeWindowsPath) {
      const parts = clean.split("/");
      clean = parts[parts.length - 1];
    }

    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return clean;
    }

    if (clean.startsWith("/uploads/")) {
      return `${BASE_URL}${clean}`;
    }

    if (clean.startsWith("/")) {
      return `${BASE_URL}${clean}`;
    }

    if (isUpload) {
      return `${BASE_URL}/uploads/${clean}`;
    }

    return `${BASE_URL}/${clean}`;
  };

  const formatValue = (value) => `INR ${Number(value || 0).toFixed(0)}`;

  const formatDate = (value) => {
    if (!value) return "-";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return value;

    return d.toISOString().split("T")[0];
  };

  const getSavedProcessFromLocal = () => {
    try {
      const store = JSON.parse(
        localStorage.getItem("truvish_redemption_process_map") || "{}"
      );

      const brandName = String(
        item?.brandName || item?.userBrandName || ""
      )
        .trim()
        .toLowerCase();

      const voucherCode = String(
        item?.voucherCode || item?.userBrandVoucher || ""
      ).trim();

      const voucherPin = String(
        item?.voucherPin || item?.userBrandPin || ""
      ).trim();

      const validityTill = String(
        item?.validityTill || item?.userBrandValidity || ""
      ).trim();

      const redeemedValue = String(
        item?.redeemedValue || item?.userBrandValue || ""
      ).trim();

      const lookupKeys = [
        `brand_voucher_pin:${brandName}__${voucherCode}__${voucherPin}`,
        `brand_voucher:${brandName}__${voucherCode}`,
        `brand_value:${brandName}__${redeemedValue}`,
        `brand_validity:${brandName}__${validityTill}`,
        `brand:${brandName}`,
      ];

      for (const key of lookupKeys) {
        const found = store[key];

        if (found?.redemptionProcess) {
          return found.redemptionProcess;
        }
      }

      return "";
    } catch (error) {
      console.error("Failed to read redemption process locally:", error);
      return "";
    }
  };

  const steps = useMemo(() => {
    const processSource = item?.redemptionProcess || getSavedProcessFromLocal() || "";

    if (!processSource) return [];

    if (Array.isArray(processSource)) {
      return processSource.map((step) => String(step).trim()).filter(Boolean);
    }

    return String(processSource)
      .split(/\r?\n|,/)
      .map((step) => step.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }, [item]);

  const handleCopy = async (label, value) => {
    if (!value || value === "-") return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(label);
      setTimeout(() => setCopiedField(""), 1200);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Copy failed");
    }
  };

  if (!item) return null;

  const logoUrl = getFullUrl(item.brandLogo, true);

  const brandName = item.brandName || item.userBrandName || "Brand";
  const voucherValue = item.redeemedValue || item.userBrandValue;
  const voucherCode = item.voucherCode || item.userBrandVoucher || "-";
  const voucherPin = item.voucherPin || item.userBrandPin || "-";
  const validityTill = item.validityTill || item.userBrandValidity;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-card history-popup-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="popup-close" onClick={onClose} type="button">
          ✕
        </button>

        <h3>Your voucher is ready</h3>

        <div className="voucher-box history-voucher-box">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="history-voucher-fallback">
              {String(brandName).charAt(0).toUpperCase()}
            </div>
          )}

          <h4>{brandName}</h4>

          <div className="voucher-separator">
            <span className="cut left"></span>
            <span className="dashed-line"></span>
            <span className="cut right"></span>
          </div>

          <div className="amount">{formatValue(voucherValue)}</div>

          <div className="history-copy-panel">
            <div className="history-copy-field">
              <span className="history-field-label">
                Gift Card / Voucher Number
              </span>

              <div className="history-field-value-row">
                <strong>{voucherCode}</strong>

                <button
                  type="button"
                  className={`history-icon-copy-btn ${
                    copiedField === "voucher" ? "copied" : ""
                  }`}
                  onClick={() => handleCopy("voucher", voucherCode)}
                  disabled={!voucherCode || voucherCode === "-"}
                  aria-label="Copy voucher code"
                  data-tooltip={copiedField === "voucher" ? "Copied" : "Copy"}
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div className="history-copy-field">
              <span className="history-field-label">Code / PIN</span>

              <div className="history-field-value-row">
                <strong>{voucherPin}</strong>

                <button
                  type="button"
                  className={`history-icon-copy-btn ${
                    copiedField === "pin" ? "copied" : ""
                  }`}
                  onClick={() => handleCopy("pin", voucherPin)}
                  disabled={!voucherPin || voucherPin === "-"}
                  aria-label="Copy voucher pin"
                  data-tooltip={copiedField === "pin" ? "Copied" : "Copy"}
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>

          <div className="history-validity">
            Valid till <strong>{formatDate(validityTill)}</strong>
          </div>

          <div className="history-redeemed-success">Redeemed Successfully</div>
        </div>

        <div className="process history-process">
          <h4>Redemption Process</h4>

          {steps.length > 0 ? (
            <ol>
              {steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          ) : (
            <p>Redemption process not available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedemptionHistoryDetailsPopup;