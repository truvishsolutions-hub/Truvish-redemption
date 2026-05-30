import React from "react";
import "./RewardCard.css";

import truvishLogo from "../assets/logo/TV-BG.png";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://truvish-backend-production.up.railway.app";

// const BASE_URL = "http://localhost:8080";

const RewardCard = ({
  onChooseReward,
  phone,
  rewardValue,
  brandLogo,
  clientThemeImg,
  validity,
}) => {
  const maskPhone = (num) => {
    if (!num) return "";

    const digits = String(num).replace(/\D/g, "");

    if (digits.length < 7) {
      return String(num);
    }

    return (
      digits.slice(0, 3) +
      "****" +
      digits.slice(-3)
    );
  };

  const makeFullUrl = (url) => {
    if (!url) return "";

    let clean = String(url)
      .trim()
      .replace(/['"]/g, "");

    clean = clean.replace(/\\/g, "/");

    const looksLikeWindowsPath =
      /^[A-Za-z]:\//.test(clean);

    if (looksLikeWindowsPath) {
      const parts = clean.split("/");
      clean = parts[parts.length - 1];
    }

    clean = clean.replace(/ /g, "%20");

    if (
      clean.startsWith("http://") ||
      clean.startsWith("https://")
    ) {
      return clean;
    }

    if (clean.startsWith("/")) {
      return `${BASE_URL}${clean}`;
    }

    return `${BASE_URL}/uploads/${clean}`;
  };

  const fullThemeImageUrl =
    makeFullUrl(clientThemeImg);

  const fullBrandLogoUrl =
    makeFullUrl(brandLogo);

  return (
    <div className="redeem-card">

      {/* TOP IMAGE */}
      <div
        className="redeem-card__top-image"
        style={{
          backgroundImage:
            fullThemeImageUrl
              ? `url(${fullThemeImageUrl})`
              : "none",
        }}
      />

      {/* CARD */}
      <div className="redeem-card__card-wrapper">
        <div className="redeem-card__card">

          {/* TOP LOGO */}
          <div className="redeem-card__logo-wrapper">

           <img
             src={
               fullBrandLogoUrl ||
               truvishLogo
             }
             alt="Logo"
             className={
               fullBrandLogoUrl
                 ? "redeem-card__logo redeem-card__logo--client"
                 : "redeem-card__logo"
             }
             onError={(e) => {
               e.currentTarget.onerror = null;
               e.currentTarget.src =
                 truvishLogo;
             }}
           />

           {!fullBrandLogoUrl && (
             <h3 className="redeem-card__logo-text">
               TRUVISH
             </h3>
           )}

            {!fullBrandLogoUrl && (
              <h3 className="redeem-card__logo-text">
                TRUVISH
              </h3>
            )}

          </div>

          {/* TITLE */}
          <h2 className="redeem-card__title">
            You have unlocked
          </h2>

          {/* AMOUNT */}
          <div className="redeem-card__amount">
            ₹{rewardValue ?? 0}
          </div>

          {/* SUB TEXT */}
          <p className="redeem-card__sub-text">
            Truvish reward value!
          </p>

          {/* DESCRIPTION */}
          <p className="redeem-card__desc">
            Redeem your reward instantly on
            100+ brands
          </p>

          {/* VERIFIED */}
          <div className="redeem-card__verified">
            Phone verified +91{" "}
            {maskPhone(phone)} ✔
          </div>

          {/* BUTTON */}
          <button
            className="redeem-card__primary-btn"
            onClick={onChooseReward}
          >
            Choose my reward
          </button>

          {/* VALIDITY */}
          <span className="redeem-card__hint">
            Valid for {validity ?? 90} months
          </span>

        </div>
      </div>

      {/* BOTTOM LOGO */}
      <div className="redeem-card__bottom-wrapper">
        <img
          src={truvishLogo}
          alt="Truvish"
          className="redeem-card__bottom-logo"
        />

        <h3 className="redeem-card__bottom-text">
          TRUVISH
        </h3>
      </div>

    </div>
  );
};

export default RewardCard;