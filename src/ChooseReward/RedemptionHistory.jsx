import React, { useEffect, useMemo, useState } from "react";
import "./RedemptionHistory.css";
import RedemptionHistoryDetailsPopup from "./RedemptionHistoryDetailsPopup";
import { FaChevronLeft } from "react-icons/fa6";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://truvish-backend-production.up.railway.app";

const RedemptionHistory = ({ onBack, truvishCode, phone }) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");

      try {
        let response = null;

        if (truvishCode) {
          response = await fetch(
            `${BASE_URL}/api/redemption-history/code/${encodeURIComponent(
              truvishCode
            )}`
          );
        } else if (phone) {
          response = await fetch(
            `${BASE_URL}/api/redemption-history/phone/${encodeURIComponent(
              phone
            )}`
          );
        } else {
          setHistoryData([]);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load redemption history");
        }

        const data = await response.json();
        setHistoryData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Unable to load redemption history.");
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [truvishCode, phone]);

  const groupedHistory = useMemo(() => {
    const groups = {};

    historyData.forEach((item) => {
      const rawDate = item?.redeemedAt;
      const parsedDate = rawDate ? new Date(rawDate) : null;

      const groupKey = parsedDate
        ? parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Unknown Date";

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(item);
    });

    return Object.entries(groups);
  }, [historyData]);

  const getStatusLabel = (status) => {
    if (!status) return "Successful";
    if (status === "FULL_REDEEM") return "Successful";
    if (status === "PARTIAL_REDEEM") return "Successful";
    return status.replaceAll("_", " ");
  };

  const formatValue = (value) => `₹${Number(value || 0)}`;

  return (
    <div className="history-page">
      <div className="history-header">
        <button type="button" className="history-back-btn" onClick={onBack}>
          <FaChevronLeft size={22} />
        </button>

        <h1>Redemption History</h1>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="history-empty-card">Loading history...</div>
        ) : error ? (
          <div className="history-empty-card">{error}</div>
        ) : groupedHistory.length === 0 ? (
          <div className="history-empty-card">No redemption history found.</div>
        ) : (
          groupedHistory.map(([date, items]) => (
            <div key={date} className="history-group">
              <p className="history-date">{date}</p>

              {items.map((item, index) => {
                const logoUrl = getFullUrl(item.brandLogo, true);

                return (
                  <div
                    key={item.id || `${item.truvishCode}-${index}`}
                    className="history-card"
                  >
                    <div className="history-card-top">
                      <div className="history-left">
                        <div className="history-brand-logo-wrap">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={item.brandName || "Brand"}
                              className="history-brand-logo"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="history-brand-fallback">
                              {String(item.brandName || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="history-info">
                          <h3>{item.brandName || "Brand"}</h3>
                          <p>{item.historyMessage || "Gift Card Redeemed"}</p>
                          <p>
                            Value: <span>{formatValue(item.redeemedValue)}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="view-details-btn"
                        onClick={() => setSelectedItem(item)}
                      >
                        View Details ›
                      </button>
                    </div>

                    <div className="history-code-row">
                      <span className="history-code">
                        Truvish Code: {item.truvishCode || "-"}
                      </span>

                      <span className="history-status">
                        {getStatusLabel(item.redeemStatus)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <RedemptionHistoryDetailsPopup
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default RedemptionHistory;