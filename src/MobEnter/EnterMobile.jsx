import React, { useState, useEffect } from "react";
import "./EnterMobile.css";
import bgImage from "../assets/EnterMob/enter.png";
import logo from "../assets/CodeEnter/image-removebg-preview.png";

const EnterMobile = ({ onBack, onSendOtp, existingPhone }) => {

  const [phone, setPhone] = useState(existingPhone || "");

  useEffect(() => {
    if (existingPhone) {
      setPhone(existingPhone);
    }
  }, [existingPhone]);

  // ⭐ Mask middle 4 digits if redeemed
  const maskPhone = (num) => {
    if (!num || num.length !== 10) return num;
    return num.slice(0, 3) + "****" + num.slice(7);
  };

  const handleSendOtp = () => {
    if (phone.length === 10) {
      onSendOtp(phone);
    } else {
      alert("Enter valid 10-digit number");
    }
  };

  return (
    <div className="enter-mobile">

      <div
        className="enter-mobile__top-image"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="enter-mobile__card-wrapper">
        <div className="enter-mobile__card">

          <img src={logo} alt="Truvish" className="enter-mobile__logo" />

          <h2 className="enter-mobile__title">
            {existingPhone
              ? "This Code Is Already Used"
              : "Enter Your Phone Number"}
          </h2>

          <p className="enter-mobile__sub-text">
            {existingPhone
              ? "This reward was already redeemed using this number"
              : "We need your phone number to deliver your gift card"}
          </p>

          <label className="enter-mobile__label">
            Phone Number
          </label>

          <div className="enter-mobile__phone-input">
            <input
              type="tel"
              placeholder="Enter your mobile"
              maxLength="10"

              // ⭐ Show masked number if redeemed
              value={existingPhone ? maskPhone(phone) : phone}

              disabled={!!existingPhone}   // number locked if redeemed

              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
            />
          </div>

          <span className="enter-mobile__hint">
            10-Digit phone number
          </span>

          <button
            className="enter-mobile__primary-btn"
            onClick={handleSendOtp}
          >
            Send OTP
          </button>

          <button
            type="button"
            className="enter-mobile__back-btn"
            onClick={onBack}
          >
            Go Back
          </button>

        </div>
      </div>
    </div>
  );
};

export default EnterMobile;
