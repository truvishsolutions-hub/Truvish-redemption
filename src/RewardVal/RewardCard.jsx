import React from "react";
import "./RewardCard.css";
import truvishLogo from "../assets/CodeEnter/image-removebg-preview.png";

const BASE_URL = "https://grateful-warmth-production-b64e.up.railway.app";

const RewardCard = ({
  onChooseReward,
  phone,
  rewardValue,
  brandLogo,
  clientThemeImg,
  validity
}) => {
  const maskPhone = (num) => {
    if (!num) return "";
    const digits = String(num).replace(/\D/g, "");

    if (digits.length < 7) return String(num);

    return digits.slice(0, 3) + "****" + digits.slice(-3);
  };

  const makeFullUrl = (url, isUpload = false) => {
    if (!url) return "";

    let clean = String(url).trim().replace(/['"]/g, "");

    // windows local path ho to filename nikal do
    clean = clean.replace(/\\/g, "/");
    const looksLikeWindowsPath = /^[A-Za-z]:\//.test(clean);

    if (looksLikeWindowsPath) {
      const parts = clean.split("/");
      clean = parts[parts.length - 1];
    }

    clean = clean.replace(/ /g, "%20");

    // already full url
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return clean;
    }

    // already /uploads/...
    if (clean.startsWith("/uploads/")) {
      return `${BASE_URL}${clean}`;
    }

    // normal relative path
    if (clean.startsWith("/")) {
      return `${BASE_URL}${clean}`;
    }

    // uploaded file only filename aaya ho
    if (isUpload) {
      return `${BASE_URL}/uploads/${clean}`;
    }

    return `${BASE_URL}/uploads/${clean}`;
  };

  const fullThemeImageUrl = makeFullUrl(clientThemeImg, false);
  const fullBrandLogoUrl = makeFullUrl(brandLogo, true);

  return (
    <div className="redeem-card">
      <div
        className="redeem-card__top-image"
        style={{
          backgroundImage: fullThemeImageUrl ? `url(${fullThemeImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      <div className="redeem-card__card-wrapper">
        <div className="redeem-card__card">
          <div className="redeem-card__logo-wrap">
            <img
              src={fullBrandLogoUrl || truvishLogo}
              alt="Brand Logo"
              className="redeem-card__logo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = truvishLogo;
              }}
            />
          </div>

          <h2 className="redeem-card__title">You Have Unlocked</h2>

          <div className="redeem-card__amount">₹{rewardValue ?? 0}</div>

          <p className="redeem-card__sub-text">TruVish Reward Value!</p>

          <p className="redeem-card__desc">
            Redeem your reward instantly on 100+ Brands
          </p>

          <div className="redeem-card__verified">
            Phone Verified +91 {maskPhone(phone)} ✔
          </div>

          <button
            className="redeem-card__primary-btn"
            onClick={onChooseReward}
          >
            Choose My Reward
          </button>

          <span className="redeem-card__hint">
            Valid for {validity ?? 90} Months
          </span>
        </div>
      </div>

      <img
        src={truvishLogo}
        alt="TruVish"
        className="redeem-card__bottom-logo"
      />
    </div>
  );
};

export default RewardCard;