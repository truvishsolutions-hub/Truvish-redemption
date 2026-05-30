import React, {
  useRef,
  useState,
} from "react";

import "./VerifyOtp.css";

import bgImage from "../assets/EnterMob/enter.png";
import logo from "../assets/logo/TV-BG.png";

// FONT
import "@fontsource/lato/300.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/lato/900.css";

const VerifyOtp = ({
  phone,
  onChangeNumber,
  onOtpVerified,
}) => {
  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
  ]);

  const inputsRef = useRef([]);

  const handleChange = (
    value,
    index
  ) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];

    nextOtp[index] = value;

    setOtp(nextOtp);

    if (
      value &&
      index < nextOtp.length - 1
    ) {
      inputsRef.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyDown = (
    e,
    index
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputsRef.current[
        index - 1
      ]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "");

    if (!pastedData) return;

    const pastedOtp = pastedData
      .slice(0, 4)
      .split("");

    const nextOtp = [
      "",
      "",
      "",
      "",
    ];

    pastedOtp.forEach(
      (digit, index) => {
        nextOtp[index] = digit;
      }
    );

    setOtp(nextOtp);

    const focusIndex = Math.min(
      pastedOtp.length,
      3
    );

    inputsRef.current[
      focusIndex
    ]?.focus();
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      alert(
        "Enter valid 4-digit OTP"
      );

      return;
    }

    onOtpVerified();
  };

  return (
    <div className="verify-otp">
      {/* TOP IMAGE */}
      <div
        className="verify-otp__top-image"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* CARD */}
      <div className="verify-otp__card-wrapper">
        <div className="verify-otp__card">
          {/* LOGO SECTION */}
          <div className="verify-otp__logo-wrapper">
            <img
              src={logo}
              alt="Truvish"
              className="verify-otp__logo"
            />

            <h3 className="verify-otp__logo-text">
              TRUVISH
            </h3>
          </div>

          {/* TITLE */}
          <h2 className="verify-otp__title">
            Verify your phone number
          </h2>

          {/* SUB TEXT */}
          <p className="verify-otp__sub-text">
            Enter the 4-digit code
            sent to your phone
          </p>

          {/* LABEL */}
          <label className="verify-otp__label">
            Enter OTP code
          </label>

          {/* OTP INPUTS */}
          <div className="verify-otp__inputs">
            {otp.map(
              (digit, index) => (
                <input
                  key={index}
                  ref={(el) =>
                    (inputsRef.current[
                      index
                    ] = el)
                  }
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleChange(
                      e.target.value,
                      index
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e,
                      index
                    )
                  }
                  onPaste={handlePaste}
                />
              )
            )}
          </div>

          {/* SENT TEXT */}
          <span className="verify-otp__sent">
            Sent to +91{" "}
            {phone ||
              "XXXXXXXXXX"}
          </span>

          {/* VERIFY BUTTON */}
          <button
            className="verify-otp__primary-btn"
            onClick={handleVerify}
          >
            Verify & continue
          </button>

          {/* RESEND */}
          <button
            type="button"
            className="verify-otp__resend"
          >
            Resend OTP
          </button>

          {/* CHANGE NUMBER */}
          <button
            type="button"
            className="verify-otp__change"
            onClick={onChangeNumber}
          >
            ⟳ Change phone number
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;