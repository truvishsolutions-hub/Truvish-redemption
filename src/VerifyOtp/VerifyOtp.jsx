import React, { useRef, useState } from "react";
import "./VerifyOtp.css";
import bgImage from "../assets/EnterMob/enter.png";
import logo from "../assets/CodeEnter/image-removebg-preview.png";

const VerifyOtp = ({ phone, onChangeNumber, onOtpVerified }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < next.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  // 🔥 ONLY ADDITION
  const handleVerify = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      alert("Enter valid 4-digit OTP");
      return;
    }

    // 👉 Abhi dummy verify (later backend se connect kar sakte ho)
    onOtpVerified();   // 🔥 VERY IMPORTANT
  };

  return (
    <div className="verify-otp">

      {/* TOP IMAGE */}
      <div
        className="verify-otp__top-image"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* CARD */}
      <div className="verify-otp__card-wrapper">
        <div className="verify-otp__card">

          <img src={logo} alt="Truvish" className="verify-otp__logo" />

          <h2 className="verify-otp__title">
            Verify Your Phone Number
          </h2>

          <p className="verify-otp__sub-text">
            Enter the 4-Digits code sent to your phone
          </p>

          <label className="verify-otp__label">
            Enter OTP Code
          </label>

          {/* OTP BOXES (4) */}
          <div className="verify-otp__inputs">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                maxLength="1"
                value={d}
                onChange={(e) => handleChange(e.target.value, i)}
              />
            ))}
          </div>

          <span className="verify-otp__sent">
            Sent to +91{phone || "XXXXXXXXXX"}
          </span>

          {/* ✅ UPDATED BUTTON */}
          <button
            className="verify-otp__primary-btn"
            onClick={handleVerify}
          >
            Verify & Continue
          </button>

          <button className="verify-otp__resend">
            Resend OTP
          </button>

          <button
            className="verify-otp__change"
            onClick={onChangeNumber}
          >
            ⟳ Change Phone Number
          </button>

        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
