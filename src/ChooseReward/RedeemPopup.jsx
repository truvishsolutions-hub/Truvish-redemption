import React, { useState } from "react";
import "./RedeemPopup.css";
import RedeemDetailsPopup from "./RedeemDetailsPopup";
import { TrophySpin } from "react-loading-indicators";
import { FaRegCopy } from "react-icons/fa6";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://truvish-backend-production.up.railway.app";

const RedeemPopup = ({
  brand,
  onClose,
  truvishCode,
  phone,
  onRedeemSuccess,
}) => {
  const [voucherDetails, setVoucherDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRedeemLoader, setShowRedeemLoader] = useState(false);
  const [hideMainPopup, setHideMainPopup] = useState(false);

  if (!brand && !voucherDetails) return null;

  const steps = Array.isArray(brand?.redemptionProcess)
    ? brand.redemptionProcess
    : String(brand?.redemptionProcess || "")
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);

  const cleanUrl = (url) => {
    if (!url) return "";

    let u = String(url).trim().replace(/['"]/g, "").replace(/ /g, "%20");
    u = u.replace(/\\/g, "/");

    const looksLikeWindowsPath = /^[A-Za-z]:\//.test(u);

    if (looksLikeWindowsPath) {
      const parts = u.split("/");
      u = parts[parts.length - 1];
    }

    if (u.startsWith("http://") || u.startsWith("https://")) {
      return u;
    }

    if (u.startsWith("/uploads/")) {
      return `${BASE_URL}${u}`;
    }

    if (u.startsWith("/")) {
      return `${BASE_URL}${u}`;
    }

    return `${BASE_URL}/uploads/${u}`;
  };

  const saveRedemptionProcessToLocal = ({
    brandName,
    voucherCode,
    voucherPin,
    validityTill,
    redeemedValue,
    redemptionProcess,
  }) => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("truvish_redemption_process_map") || "{}"
      );

      const normalizedBrand = String(brandName || "").trim().toLowerCase();
      const normalizedVoucher = String(voucherCode || "").trim();
      const normalizedPin = String(voucherPin || "").trim();
      const normalizedValidity = String(validityTill || "").trim();
      const normalizedValue = String(redeemedValue || "").trim();

      const payload = {
        brandName,
        voucherCode,
        voucherPin,
        validityTill,
        redeemedValue,
        redemptionProcess,
        savedAt: Date.now(),
      };

      const keys = [
        `brand:${normalizedBrand}`,
        `brand_voucher:${normalizedBrand}__${normalizedVoucher}`,
        `brand_voucher_pin:${normalizedBrand}__${normalizedVoucher}__${normalizedPin}`,
        `brand_value:${normalizedBrand}__${normalizedValue}`,
        `brand_validity:${normalizedBrand}__${normalizedValidity}`,
      ];

      keys.forEach((key) => {
        if (key && !key.endsWith("__") && !key.includes("undefined")) {
          existing[key] = payload;
        }
      });

      localStorage.setItem(
        "truvish_redemption_process_map",
        JSON.stringify(existing)
      );
    } catch (error) {
      console.error("Failed to save redemption process locally:", error);
    }
  };

  const handleRedeem = async () => {
    try {
      setLoading(true);

      const payload = {
        code: truvishCode || "",
        phone: phone || "",
        brandName: brand?.inventoryVoucherName || "",
        selectedValue: Number(brand?.selectedValue || 0),
        brandLogo: brand?.inventoryVoucherLogoUrl || "",
      };

      const res = await fetch(`${BASE_URL}/api/redeem/body`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || "Redeem failed");
      }

      const data = text ? JSON.parse(text) : {};

      setShowRedeemLoader(true);
      setHideMainPopup(true);

      setTimeout(() => {
        const mergedVoucherDetails = {
          ...data,
          selectedValue: brand?.selectedValue,
          inventoryVoucherLogoUrl:
            data?.inventoryVoucherLogoUrl ||
            cleanUrl(brand?.inventoryVoucherLogoUrl),
          inventoryVoucherName:
            data?.inventoryVoucherName || brand?.inventoryVoucherName,
          inventoryVoucherBrandUrl:
            data?.inventoryVoucherBrandUrl || brand?.inventoryVoucherBrandUrl,
          redemptionProcess:
            data?.redemptionProcess || brand?.redemptionProcess,
          truvishCode: truvishCode || "",
        };

        setVoucherDetails(mergedVoucherDetails);

        saveRedemptionProcessToLocal({
          brandName:
            mergedVoucherDetails?.brandName ||
            mergedVoucherDetails?.inventoryVoucherName ||
            brand?.inventoryVoucherName,
          voucherCode:
            mergedVoucherDetails?.voucher ||
            mergedVoucherDetails?.voucherCode,
          voucherPin:
            mergedVoucherDetails?.pin ||
            mergedVoucherDetails?.voucherPin,
          validityTill: mergedVoucherDetails?.validityTill,
          redeemedValue:
            mergedVoucherDetails?.redeemedValue || brand?.selectedValue,
          redemptionProcess:
            mergedVoucherDetails?.redemptionProcess || brand?.redemptionProcess,
        });

        setShowRedeemLoader(false);

        if (onRedeemSuccess) {
          onRedeemSuccess();
        }
      }, 1600);
    } catch (err) {
      alert(err.message || "Redeem failed");
      setShowRedeemLoader(false);
      setHideMainPopup(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsClose = () => {
    setVoucherDetails(null);
    setHideMainPopup(false);
    onClose();
  };

  return (
    <>
      {brand && !hideMainPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <button className="popup-close" onClick={onClose} type="button">
              ✕
            </button>

            <h3>How to redeem this voucher</h3>

            <div className="voucher-box">
              <img
                src={cleanUrl(brand?.inventoryVoucherLogoUrl)}
                alt={brand?.inventoryVoucherName}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <h4>{brand?.inventoryVoucherName}</h4>

              <div className="voucher-separator">
                <span className="cut left"></span>
                <span className="dashed-line"></span>
                <span className="cut right"></span>
              </div>

              <div className="amount">INR {brand?.selectedValue}</div>

              <button
                className="redeem-main"
                onClick={handleRedeem}
                disabled={loading}
                type="button"
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
      )}

      {showRedeemLoader && (
        <div className="redeem-loader-overlay">
          <div className="redeem-loader-box">
            <TrophySpin
              color={["#1d7a76", "#27a39d", "#31ccc5", "#59d7d1"]}
            />
            <p>Preparing your voucher...</p>
          </div>
        </div>
      )}

      <RedeemDetailsPopup
        voucher={voucherDetails}
        onClose={handleDetailsClose}
        CopyIcon={FaRegCopy}
      />
    </>
  );
};

export default RedeemPopup;