import React, { useRef, useState } from "react";
import "./VerifyOtp.css";
import bgImage from "../assets/EnterMob/enter.png";
import logo from "../assets/CodeEnter/image-removebg-preview.png";

const VerifyOtp = ({ phone, onChangeNumber, onOtpVerified }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < nextOtp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedData) return;

    const pastedOtp = pastedData.slice(0, 4).split("");
    const nextOtp = ["", "", "", ""];

    pastedOtp.forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);

    const focusIndex = Math.min(pastedOtp.length, 3);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      alert("Enter valid 4-digit OTP");
      return;
    }

    onOtpVerified();
  };

  return (
    <div className="verify-otp">
      <div
        className="verify-otp__top-image"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <div className="verify-otp__card-wrapper">
        <div className="verify-otp__card">
          <img src={logo} alt="Truvish" className="verify-otp__logo" />

          <h2 className="verify-otp__title">Verify Your Phone Number</h2>

          <p className="verify-otp__sub-text">
            Enter the 4-digit code sent to your phone
          </p>

          <label className="verify-otp__label">Enter OTP Code</label>

          <div className="verify-otp__inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <span className="verify-otp__sent">
            Sent to +91 {phone || "XXXXXXXXXX"}
          </span>

          <button
            className="verify-otp__primary-btn"
            onClick={handleVerify}
          >
            Verify & Continue
          </button>

          <button
            type="button"
            className="verify-otp__resend"
          >
            Resend OTP
          </button>

          <button
            type="button"
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