import React, { useState } from "react";
import axios from "axios";
import "../CodeEnter/TruvCod.css";
import bgImage from "../assets/CodeEnter/truvish1.jpg";
import logo from "../assets/CodeEnter/image-removebg-preview.png";

const TruvCod = ({ onSuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    const finalCode = code.trim().toUpperCase();

    if (finalCode.length !== 8 && finalCode.length !== 16) {
      alert("Please enter a valid code");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Fetch code details from backend
      const response = await axios.get(
        `http://localhost:8080/api/truvish/verify/${encodeURIComponent(finalCode)}`
      );

      // 🔥 Pass all required data to App.jsx
      onSuccess({
        code: finalCode,
        status: response.data.status,
        existingPhone: response.data.phone || null,

        value: response.data.value,
        logoUrl: response.data.logoUrl,

        clientTheme: response.data.clientTheme,
        clientThemeImg: response.data.clientThemeImg   // ⭐ NEW
      });


    } catch (error) {
      alert(error.response?.data || "Invalid code. Please check again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="top-image" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="card-wrapper">
        <div className="card">
          <img src={logo} alt="Truvish Logo" className="logo" />
          <h2>Redeem Your TruVish Rewards Code</h2>
          <p>Use your code to get instant gift cards from Amazon, Flipkart, Swiggy & more</p>

          <label className="input-label">Enter Your Code</label>
          <div className="code-input">
            <input
              type="text"
              placeholder="Enter Your Code"
              maxLength="16"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <button onClick={handleRedeem} disabled={loading}>
            {loading ? "Verifying..." : "🎁 Redeem Now"}
          </button>

          <span className="trusted">Trusted by 100+ Brands</span>
        </div>
      </div>
    </div>
  );
};

export default TruvCod;
