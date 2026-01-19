import React from "react";
import "./RewardCard.css";
import truvishLogo from "../assets/CodeEnter/image-removebg-preview.png";

const RewardCard = ({
  onChooseReward,
  phone,
  rewardValue,
  brandLogo,
  clientThemeImg
}) => {

  console.log("RewardCard Component Loaded");
  console.log("THEME IMG FROM API =", clientThemeImg);

  // ⭐ Mask Phone (3 + **** + 3)
  const maskPhone = (num) => {
    if (!num || num.length !== 10) return num;
    return num.slice(0, 3) + "****" + num.slice(7);
  };

  // Clean the URL
  let cleanUrl = clientThemeImg;

  if (cleanUrl) {
    cleanUrl = cleanUrl.replace(/['"]/g, ""); // remove extra quotes
    cleanUrl = cleanUrl.replace(/ /g, "%20"); // ⭐ Fix spaces in filename
  }

  // Convert relative → absolute
  const fullImageUrl = cleanUrl?.startsWith("http")
    ? cleanUrl
    : cleanUrl
    ? `http://localhost:8080${cleanUrl}`
    : "";

  return (
    <div className="redeem-card">

      <div
        className="redeem-card__top-image"
        style={{ backgroundImage: fullImageUrl ? `url(${fullImageUrl})` : "none" }}
      />

      <div className="redeem-card__card-wrapper">
        <div className="redeem-card__card">

          <img src={brandLogo} alt="Brand Logo" className="redeem-card__logo" />

          <h2 className="redeem-card__title">You Have Unlocked</h2>

          <div className="redeem-card__amount">₹{rewardValue}</div>

          <p className="redeem-card__sub-text">TruVish Reward Value!</p>

          <p className="redeem-card__desc">Redeem your reward instantly on 100+ Brands</p>

          <div className="redeem-card__verified">
            Phone Verified +{maskPhone(phone)} ✔   {/* ⭐ Masked phone */}
          </div>

          <button
            className="redeem-card__primary-btn"
            onClick={onChooseReward}
          >
            Choose My Reward
          </button>

          <span className="redeem-card__hint">Valid for 90 Days</span>
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
