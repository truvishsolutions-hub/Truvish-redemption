import React, { useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import RedeemPopup from "../ChooseReward/RedeemPopup";
import "./ChooseReward.css";

const BASE_URL = "https://grateful-warmth-production-b64e.up.railway.app";

const ChooseReward = ({
  rewardValue,
  brandLogo,
  truvishCode,
  phone,
  clientCategories = [],  // ✅ Default empty array
  clientBrands = []        // ✅ Default empty array
}) => {
  const [allBrands, setAllBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // ✅ Function to filter denominations based on reward value
  const getFilteredDenominations = (denominations, rewardAmount) => {
    if (!denominations || !Array.isArray(denominations)) return [];

    // Filter denominations that are less than or equal to reward amount
    const filtered = denominations.filter(denom => denom <= rewardAmount);

    // Sort ascending
    return filtered.sort((a, b) => a - b);
  };

  // ✅ Filter brands based on client categories AND available denominations
  const brands = useMemo(() => {
    console.log("📊 Client Categories from API:", clientCategories);
    console.log("💰 Reward Value:", rewardValue);
    console.log("📦 All Brands:", allBrands);

    if (!allBrands || allBrands.length === 0) {
      return [];
    }

    // First filter by category
    let filteredByCategory = allBrands;

    if (clientCategories && clientCategories.length > 0) {
      filteredByCategory = allBrands.filter(brand => {
        const brandCategory = brand.inventoryVoucherCatogry?.toLowerCase();
        const matches = clientCategories.some(cat =>
          brandCategory === cat.toLowerCase()
        );
        if (matches) {
          console.log(`✅ Brand ${brand.inventoryVoucherName} matches category ${brandCategory}`);
        }
        return matches;
      });
    } else {
      console.log("No categories specified, checking all brands");
    }

    // ✅ SECOND FILTER: Only keep brands that have at least one denomination <= rewardValue
    const brandsWithAvailableValues = filteredByCategory.filter(brand => {
      const availableDenoms = getFilteredDenominations(
        brand.inventoryVoucherDenomenation,
        rewardValue
      );
      const hasAvailable = availableDenoms.length > 0;

      if (!hasAvailable) {
        console.log(`❌ Brand ${brand.inventoryVoucherName} has no values <= ${rewardValue}`);
      } else {
        console.log(`✅ Brand ${brand.inventoryVoucherName} has values:`, availableDenoms);
      }

      return hasAvailable;
    });

    console.log(`🎯 Final filtered ${brandsWithAvailableValues.length} brands with available values`);
    return brandsWithAvailableValues;
  }, [allBrands, clientCategories, rewardValue]);

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 3500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: false
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: false,
      containScroll: "keepSnaps"
    },
    [autoplay]
  );

  const getFullUrl = (url, isUpload = false) => {
    if (!url) return "";

    let clean = String(url).trim().replace(/['"]/g, "");
    clean = clean.replace(/\\/g, "/").replace(/ /g, "%20");

    const looksLikeWindowsPath = /^[A-Za-z]:\//.test(clean);
    if (looksLikeWindowsPath) {
      const parts = clean.split("/");
      clean = parts[parts.length - 1];
    }

    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return clean;
    }

    if (clean.startsWith("/uploads/")) {
      return `${BASE_URL}${clean}`;
    }

    if (clean.startsWith("/")) {
      return `${BASE_URL}${clean}`;
    }

    if (isUpload) {
      return `${BASE_URL}/uploads/${clean}`;
    }

    return `${BASE_URL}/${clean}`;
  };

  const fullLogo = getFullUrl(brandLogo, true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/config`)
      .then((res) => res.json())
      .then((cfg) => {
        const arr = [cfg.banner1, cfg.banner2, cfg.banner3, cfg.banner4]
          .filter(Boolean)
          .map((img) => getFullUrl(img, false));

        setBanners(arr);
      })
      .catch((err) => console.error("Banner fetch error:", err));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    console.log("📡 Fetching inventory from:", `${BASE_URL}/api/inventory`);
    fetch(`${BASE_URL}/api/inventory`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Inventory Data Received:", data);
        setAllBrands(data || []);
      })
      .catch((err) => console.error("Inventory API error:", err));
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        openDropdownId !== null &&
        dropdownRefs.current[openDropdownId] &&
        !dropdownRefs.current[openDropdownId].contains(e.target)
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openDropdownId]);

  // ✅ Filter brands based on search and active tab
  const filteredBrands = brands.filter((b) => {
    const s = search.toLowerCase();

    return (
      b.inventoryVoucherName?.toLowerCase().includes(s) &&
      (activeTab === "All" ||
        b.inventoryVoucherCatogry?.toLowerCase() === activeTab.toLowerCase())
    );
  });

  const handleSelectValue = (inventoryId, value) => {
    console.log(`🎯 Selected value ${value} for brand ${inventoryId}`);
    setSelectedBrandId(inventoryId);
    setSelectedAmount(Number(value));
    setOpenDropdownId(null);
  };

  const handleRedeem = (brand) => {
    if (selectedBrandId !== brand.inventoryId || !selectedAmount) {
      alert("Please select a value first!");
      return;
    }

    console.log(`🔄 Redeeming ${selectedAmount} from ${brand.inventoryVoucherName}`);
    setSelectedBrand({
      ...brand,
      selectedValue: selectedAmount
    });
  };

  return (
    <div className="reward-page">
      <div className="reward-header">
        <div className="header-left">
          {fullLogo && (
            <img
              src={fullLogo}
              alt="Client Logo"
              className="header-brand-logo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>

        <div className="balance-box">
          ₹{rewardValue ?? 0}
          <br />
          <span>Available Balance</span>
        </div>
      </div>

      <div className="reward-content">
        {banners.length > 0 && (
          <div className="embla-banner-section">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container">
                {banners.map((img, i) => (
                  <div className="embla__slide" key={i}>
                    <div
                      className={`embla__slide__inner ${
                        activeIndex === i ? "is-active" : ""
                      }`}
                    >
                      <img src={img} alt={`banner-${i + 1}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="embla__dots">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`embla__dot ${activeIndex === i ? "active" : ""}`}
                  onClick={() => emblaApi && emblaApi.scrollTo(i)}
                />
              ))}
            </div>
          </div>
        )}

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

        <div className="brand-grid">
          {filteredBrands.length === 0 ? (
            <div className="no-brands-message">
              <p>No brands available for your reward amount</p>
              {clientCategories.length > 0 && (
                <p>Categories: {clientCategories.join(", ")}</p>
              )}
              <p>Available balance: ₹{rewardValue}</p>
              <p className="hint-text">Try a different code with higher value</p>
            </div>
          ) : (
            filteredBrands.map((b) => {
              const logoUrl = getFullUrl(b.inventoryVoucherLogoUrl, true);
              const isDropdownOpen = openDropdownId === b.inventoryId;
              const isCurrentSelected = selectedBrandId === b.inventoryId;
              const currentValue = isCurrentSelected ? selectedAmount : null;
              const isValueSelected = !!currentValue;

              // ✅ Get filtered denominations for this brand
              const availableDenominations = getFilteredDenominations(
                b.inventoryVoucherDenomenation,
                rewardValue
              );

              return (
                <div
                  className={`brand-card ${isDropdownOpen ? "dropdown-open-card" : ""}`}
                  key={b.inventoryId}
                >
                  {b.inventoryVoucherLogoUrl ? (
                    <img
                      src={logoUrl}
                      alt={b.inventoryVoucherName}
                      className="brand-image"
                    />
                  ) : (
                    <div className="brand-image placeholder" />
                  )}

                  <h4>{b.inventoryVoucherName}</h4>

                  <div
                    className={`select-wrapper ${isValueSelected ? "selected" : ""} ${
                      isDropdownOpen ? "open" : ""
                    }`}
                    ref={(el) => {
                      dropdownRefs.current[b.inventoryId] = el;
                    }}
                  >
                    <label className="select-label">Select Value</label>

                    <button
                      type="button"
                      className={`amount-box custom-dropdown-trigger ${
                        isDropdownOpen ? "open" : ""
                      } ${isValueSelected ? "has-value" : ""}`}
                      onClick={() =>
                        setOpenDropdownId((prev) =>
                          prev === b.inventoryId ? null : b.inventoryId
                        )
                      }
                    >
                      <span>
                        {currentValue ? `INR ${currentValue}` : "Choose Amount"}
                      </span>
                      <span className="dropdown-arrow">
                        {isDropdownOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    <div
                      className={`custom-dropdown-menu ${
                        isDropdownOpen ? "show" : ""
                      }`}
                    >
                      {availableDenominations.map((val, i) => (
                        <button
                          type="button"
                          key={i}
                          className={`dropdown-option ${
                            currentValue === val ? "active" : ""
                          }`}
                          onClick={() => handleSelectValue(b.inventoryId, val)}
                        >
                          INR {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    className={`redeem-btn ${isValueSelected ? "enabled" : ""}`}
                    onClick={() => handleRedeem(b)}
                    disabled={!isValueSelected}
                  >
                    Redeem
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <RedeemPopup
        brand={selectedBrand}
        truvishCode={truvishCode}
        phone={phone}
        rewardValue={rewardValue}
        onClose={() => setSelectedBrand(null)}
      />
    </div>
  );
};

export default ChooseReward;