import React, { useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import RedeemPopup from "./RedeemPopup";
import "./ChooseReward.css";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://truvish-backend-production.up.railway.app";

const ChooseReward = ({
  rewardValue = 0,
  brandLogo,
  truvishCode,
  phone,
  clientCategories = [],
  clientBrands = [],
  onCodeHistory,
  onBalanceUpdate,
}) => {
  const [allBrands, setAllBrands] = useState([]);
  const [brandDenominations, setBrandDenominations] = useState({});
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [redeemPopupOpen, setRedeemPopupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dropdownRefs = useRef({});
  const menuRef = useRef(null);

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 3500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: false,
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: false,
      containScroll: "keepSnaps",
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

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/inventory`);
      const data = await res.json();
      setAllBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Inventory API error:", err);
      setAllBrands([]);
    }
  };

  const fetchLatestBalance = async () => {
    if (!truvishCode) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/truvish/verify/${encodeURIComponent(truvishCode)}`
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data?.value != null) {
        onBalanceUpdate?.(Number(data.value || 0));
      }
    } catch (error) {
      console.error("Live balance update failed:", error);
    }
  };

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
    fetchInventory();
  }, []);

  useEffect(() => {
    if (!truvishCode) return;

    fetchLatestBalance();

    const interval = setInterval(fetchLatestBalance, 5000);

    return () => clearInterval(interval);
  }, [truvishCode]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        openDropdownId !== null &&
        dropdownRefs.current[openDropdownId] &&
        !dropdownRefs.current[openDropdownId].contains(e.target)
      ) {
        setOpenDropdownId(null);
      }

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openDropdownId]);

  const normalizedAllowedBrands = useMemo(() => {
    return (clientBrands || [])
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());
  }, [clientBrands]);

  const normalizedAllowedCategories = useMemo(() => {
    return (clientCategories || [])
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());
  }, [clientCategories]);

  const brands = useMemo(() => {
    let filtered = Array.isArray(allBrands) ? [...allBrands] : [];

    if (normalizedAllowedBrands.length > 0) {
      filtered = filtered.filter((brand) =>
        normalizedAllowedBrands.includes(
          String(brand.inventoryVoucherName || "").trim().toLowerCase()
        )
      );
    } else if (normalizedAllowedCategories.length > 0) {
      filtered = filtered.filter((brand) =>
        normalizedAllowedCategories.includes(
          String(brand.inventoryVoucherCatogry || "").trim().toLowerCase()
        )
      );
    }

    return filtered;
  }, [allBrands, normalizedAllowedBrands, normalizedAllowedCategories]);

  useEffect(() => {
    const loadDenominations = async () => {
      const entries = await Promise.all(
        brands.map(async (brand) => {
          const brandName = brand.inventoryVoucherName;

          try {
            const res = await fetch(
              `${BASE_URL}/api/voucher-inventory/denominations?brandName=${encodeURIComponent(
                brandName
              )}`
            );

            if (!res.ok) {
              return [brand.inventoryId, []];
            }

            const data = await res.json();

            const filtered = (Array.isArray(data) ? data : [])
              .map((v) => Number(v))
              .filter(
                (v) =>
                  !Number.isNaN(v) &&
                  Number(v) > 0 &&
                  Number(v) <= Number(rewardValue || 0)
              )
              .sort((a, b) => a - b);

            return [brand.inventoryId, filtered];
          } catch (error) {
            console.error(`Denomination load failed for ${brandName}`, error);
            return [brand.inventoryId, []];
          }
        })
      );

      setBrandDenominations(Object.fromEntries(entries));
    };

    if (brands.length > 0) {
      loadDenominations();
    } else {
      setBrandDenominations({});
    }
  }, [brands, rewardValue]);

  const filteredBrands = useMemo(() => {
    const s = search.toLowerCase();

    return brands.filter((b) => {
      const brandName = String(b.inventoryVoucherName || "").toLowerCase();
      const brandCategory = String(
        b.inventoryVoucherCatogry || ""
      ).toLowerCase();
      const availableDenominations = brandDenominations[b.inventoryId] || [];

      return (
        brandName.includes(s) &&
        availableDenominations.length > 0 &&
        (activeTab === "All" || brandCategory === activeTab.toLowerCase())
      );
    });
  }, [brands, search, activeTab, brandDenominations]);

  const handleSelectValue = (brand, value) => {
    setSelectedBrand({
      ...brand,
      selectedValue: Number(value),
    });

    setSelectedBrandName(brand.inventoryVoucherName);
    setSelectedAmount(Number(value));
    setOpenDropdownId(null);
  };

  const handleRedeem = (brand) => {
    if (selectedBrandName !== brand.inventoryVoucherName || !selectedAmount) {
      alert("Please select a value first!");
      return;
    }

    setSelectedBrand({
      ...brand,
      selectedValue: selectedAmount,
    });

    setRedeemPopupOpen(true);
  };

  const handleRedeemSuccess = async () => {
    await fetchInventory();
    await fetchLatestBalance();

    setRedeemPopupOpen(false);
    setSelectedBrand(null);
    setSelectedBrandName("");
    setSelectedAmount(null);
    setOpenDropdownId(null);
  };

  const handleCodeHistoryClick = () => {
    setMenuOpen(false);
    onCodeHistory?.();
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

        <div className="header-right" ref={menuRef}>
          <div className="balance-box">
            ₹{Number(rewardValue || 0)}
            <br />
            <span>Available Balance</span>
          </div>

          <button
            type="button"
            className={`burger-menu ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`menu-dropdown ${menuOpen ? "show" : ""}`}>
            <button
              type="button"
              className="menu-item"
              onClick={handleCodeHistoryClick}
            >
              Code History
            </button>
          </div>
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
            placeholder="Search brands"
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
                  type="button"
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
              <p>No brands available for your reward amount.</p>

              {clientBrands.length > 0 && (
                <p>Allowed Brands: {clientBrands.join(", ")}</p>
              )}

              {clientCategories.length > 0 && (
                <p>Allowed Categories: {clientCategories.join(", ")}</p>
              )}

              <p>Available balance: ₹{Number(rewardValue || 0)}</p>
            </div>
          ) : (
            filteredBrands.map((b) => {
              const logoUrl = getFullUrl(b.inventoryVoucherLogoUrl, true);
              const isDropdownOpen = openDropdownId === b.inventoryId;
              const isCurrentSelected =
                selectedBrandName === b.inventoryVoucherName;
              const currentValue = isCurrentSelected ? selectedAmount : null;
              const isValueSelected = !!currentValue;
              const availableDenominations =
                brandDenominations[b.inventoryId] || [];

              return (
                <div
                  className={`brand-card ${
                    isDropdownOpen ? "dropdown-open-card" : ""
                  }`}
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
                    className={`select-wrapper ${
                      isValueSelected ? "selected" : ""
                    } ${isDropdownOpen ? "open" : ""}`}
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
                      {availableDenominations.length === 0 ? (
                        <div className="dropdown-option disabled">
                          No value available
                        </div>
                      ) : (
                        availableDenominations.map((val, i) => (
                          <button
                            type="button"
                            key={i}
                            className={`dropdown-option ${
                              currentValue === val ? "active" : ""
                            }`}
                            onClick={() => handleSelectValue(b, val)}
                          >
                            INR {val}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    className={`redeem-btn ${isValueSelected ? "enabled" : ""}`}
                    onClick={() => handleRedeem(b)}
                    disabled={!isValueSelected}
                    type="button"
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
        brand={redeemPopupOpen ? selectedBrand : null}
        onClose={() => setRedeemPopupOpen(false)}
        truvishCode={truvishCode}
        phone={phone}
        onRedeemSuccess={handleRedeemSuccess}
      />
    </div>
  );
};

export default ChooseReward;