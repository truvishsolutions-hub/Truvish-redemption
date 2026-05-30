import React, { useEffect, useState } from "react";

import "./EnterMobile.css";

import bgImage from "../assets/EnterMob/enter.png";
import logo from "../assets/logo/TV-BG.png";

// FONT
import "@fontsource/lato/300.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/lato/900.css";

const EnterMobile = ({
  onBack,
  onSendOtp,
  existingPhone,
}) => {
  const [phone, setPhone] = useState(
    existingPhone || ""
  );

  useEffect(() => {
    if (existingPhone) {
      setPhone(existingPhone);
    } else {
      setPhone("");
    }
  }, [existingPhone]);

  // MASK PHONE
  const maskPhone = (num) => {
    if (!num || num.length !== 10)
      return num;

    return (
      num.slice(0, 3) +
      "****" +
      num.slice(7)
    );
  };

  const handleSendOtp = () => {
    if (phone.length === 10) {
      onSendOtp(phone);
    } else {
      alert(
        "Enter valid 10-digit number"
      );
    }
  };

  return (
    <div className="enter-mobile">
      {/* TOP IMAGE */}
      <div
        className="enter-mobile__top-image"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* CARD */}
      <div className="enter-mobile__card-wrapper">
        <div className="enter-mobile__card">
          {/* LOGO SECTION */}
          <div className="enter-mobile__logo-wrapper">
            <img
              src={logo}
              alt="Truvish"
              className="enter-mobile__logo"
            />

            <h3 className="enter-mobile__logo-text">
              TRUVISH
            </h3>
          </div>

          {/* TITLE */}
          <h2 className="enter-mobile__title">
            {existingPhone
              ? "This code is already used"
              : "Enter your phone number"}
          </h2>

          {/* SUB TEXT */}
          <p className="enter-mobile__sub-text">
            {existingPhone
              ? "This reward was already redeemed using this number"
              : "We need your phone number to deliver your gift card"}
          </p>

          {/* LABEL */}
          <label className="enter-mobile__label">
            Phone number
          </label>

          {/* INPUT */}
          <div className="enter-mobile__phone-input">
            <input
              type="tel"
              placeholder="Enter your mobile"
              maxLength={10}
              value={
                existingPhone
                  ? maskPhone(phone)
                  : phone
              }
              disabled={!!existingPhone}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />
          </div>

          {/* HINT */}
          <span className="enter-mobile__hint">
            10-Digit phone number
          </span>

          {/* BUTTON */}
          <button
            className="enter-mobile__primary-btn"
            onClick={handleSendOtp}
          >
            Send otp
          </button>

          {/* BACK BUTTON */}
          <button
            type="button"
            className="enter-mobile__back-btn"
            onClick={onBack}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterMobile;