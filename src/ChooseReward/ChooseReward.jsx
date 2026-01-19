import React, { useEffect, useState } from "react";
import RedeemPopup from "../ChooseReward/RedeemPopup";
import "./ChooseReward.css";

const ChooseReward = ({ rewardValue, brandLogo, truvishCode, phone }) => {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // ⭐ Each brand gets its own selected value
  const [selectedValues, setSelectedValues] = useState({});

  /* ⭐ FETCH BANNERS */
  useEffect(() => {
    fetch("http://localhost:8080/api/admin/config")
      .then((res) => res.json())
      .then((cfg) => {
        const arr = [
          cfg.banner1,
          cfg.banner2,
          cfg.banner3,
          cfg.banner4,
        ].filter(Boolean);

        setBanners(arr);
      })
      .catch((err) => console.error("Banner fetch error:", err));
  }, []);

  /* ⭐ Autoplay Infinite Scroll */
  useEffect(() => {
    if (banners.length === 0) return;

    let i = 0;
    const interval = setInterval(() => {
      setActiveIndex(i % banners.length);
      i++;
    }, 2000);

    return () => clearInterval(interval);
  }, [banners]);

  /* ⭐ Fetch Inventory */
  useEffect(() => {
    fetch("http://localhost:8080/api/inventory")
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((err) => console.error("Inventory API error:", err));
  }, []);

  const filteredBrands = brands.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.inventoryVoucherName?.toLowerCase().includes(s) &&
      (activeTab === "All" ||
        b.inventoryVoucherCatogry?.toLowerCase() === activeTab.toLowerCase())
    );
  });

  const infiniteBanners = [...banners, ...banners, ...banners];

  return (
    <div className="reward-page">
      {/* HEADER */}
      <div className="reward-header">
        <div className="header-left">
          {brandLogo && (
            <img src={brandLogo} alt="Brand Logo" className="header-brand-logo" />
          )}
        </div>

        <div className="balance-box">
          ₹{rewardValue}
          <br />
          <span>Available Balance</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="reward-content">
        <h2>Choose Your Reward</h2>
        <p className="subtitle">Select from 100+ trusted Brands</p>

        {/* INFINITE CAROUSEL */}
        {banners.length > 0 && (
          <div className="infinite-carousel">
            <div className="carousel-track">
              {infiniteBanners.map((img, i) => {
                const realIndex = i % banners.length;

                return (
                  <div
                    key={i}
                    className={`carousel-card ${
                      activeIndex === realIndex ? "active" : ""
                    }`}
                  >
                    <img src={`http://localhost:8080${img}`} alt="banner" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEARCH + TABS */}
        <div className="sticky-filter">
          <input
            className="search"
            placeholder="🔍 Search brands"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="tabs">
            {["All", "Shopping", "Food", "Entertainment", "Movie", "Traveling"].map(
              (tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* BRAND GRID */}
        <div className="brand-grid">
          {filteredBrands.map((b) => (
            <div className="brand-card" key={b.inventoryId}>

              {b.inventoryVoucherLogoUrl ? (
                <img
                  src={b.inventoryVoucherLogoUrl}
                  alt={b.inventoryVoucherName}
                  className="brand-image"
                />
              ) : (
                <div className="brand-image placeholder" />
              )}

              <h4>{b.inventoryVoucherName}</h4>

              {/* ⭐ Each brand has its own selected value */}
              <select
                className="amount-box"
                value={selectedValues[b.inventoryId] ?? ""}
                onChange={(e) =>
                  setSelectedValues({
                    [b.inventoryId]: Number(e.target.value),  // ⭐ FINAL FIX
                  })
                }
              >
                <option value="">Select Value</option>
                {b.inventoryVoucherDenomenation?.map((val, i) => (
                  <option key={i} value={val}>INR {val}</option>
                ))}
              </select>

              <button
                className="redeem-btn"
                onClick={() =>
                  selectedValues[b.inventoryId]
                    ? setSelectedBrand({
                        ...b,
                        selectedValue: selectedValues[b.inventoryId],
                      })
                    : alert("Please select a value first!")
                }
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      <RedeemPopup
        brand={selectedBrand}
        truvishCode={truvishCode}
        phone={phone}
        onClose={() => setSelectedBrand(null)}
      />
    </div>
  );
};

export default ChooseReward;
