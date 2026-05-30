import React, { useState } from "react";
import axios from "axios";
import "../CodeEnter/TruvCod.css";

import bgImage from "../assets/CodeEnter/truvish1.jpg";
import logo from "../assets/logo/TV-BG.png";

// Fonts
import "@fontsource/lato/300.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/lato/900.css";

// Backend URL
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://truvish-backend-production.up.railway.app";

// const BASE_URL = "http://localhost:8080";

const TruvCod = ({ onSuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Redeem Handler
  const handleRedeem = async () => {
    const finalCode = code.trim().toUpperCase();

    // Validation
    if (finalCode.length !== 8 && finalCode.length !== 12) {
      alert("Please enter a valid code");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/truvish/verify/${encodeURIComponent(finalCode)}`
      );

      console.log("API Response:", response.data);

      onSuccess({
        code: finalCode,
        status: response.data.status,
        existingPhone: response.data.phone || null,
        value: response.data.value || null,
        clientImg: response.data.clientImg || null,
        validity: response.data.validity || null,
        clientThemeImg: response.data.clientThemeImg || null,
        clientBrand: response.data.clientBrand || [],
        clientCategory: response.data.clientCategory || [],
      });
    } catch (error) {
      alert(
        error.response?.data || "Invalid code. Please check again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enter Key Support
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRedeem();
    }
  };

  return (
    <div className="page">
      {/* TOP IMAGE */}
      <div
        className="top-image"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* CARD */}
      <div className="card-wrapper">
        <div className="card">

          {/* LOGO */}
          <div className="logo-wrapper">
            <img
              src={logo}
              alt="Truvish Logo"
              className="logo"
            />

            <h3 className="logo-text">TRUVISH</h3>
          </div>

          {/* TITLE */}
          <h2>Redeem your truvish rewards code</h2>

          {/* DESCRIPTION */}
          <p>
            Use your code to get instant gift cards from
            Amazon, Flipkart, Swiggy & more
          </p>

          {/* LABEL */}
          <label className="input-label">
            Enter your code
          </label>

          {/* INPUT */}
          <div className="code-input">
            <input
              type="text"
              placeholder="XXXX-XXXX"
              maxLength={16}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase())
              }
              onKeyDown={handleKeyPress}
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleRedeem}
            disabled={loading}
          >
            {loading ? "Verifying..." : "🎁 Redeem now"}
          </button>

          {/* FOOTER */}
          <span className="trusted">
            Trusted by 100+ brands
          </span>
        </div>
      </div>
    </div>
  );
};

export default TruvCod;