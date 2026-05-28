// ShareVoucherDetails.jsx - FINAL UPDATED

import React, { useState } from "react";
import axios from "axios";

import "./ShareVoucherDetails.css";

import { IoClose } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { IoPaperPlaneOutline } from "react-icons/io5";


const BASE_URL =
  import.meta.env.VITE_API_URL || "https://truvish-backend-production.up.railway.app";
// const BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:8080";

export default function ShareVoucherDetails({
  open,
  onClose,
  onSuccess,
  voucher,
}) {

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 SUCCESS TOP MESSAGE
  const [showSuccess, setShowSuccess] =
    useState(false);

  if (!open) return null;

  const handleSend = async () => {

    if (!email.trim()) {
      alert("Please enter recipient email");
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        `${BASE_URL}/api/user-email/send`,
        {

          email: email.trim(),

          name: name.trim(),

          voucherCode:
            voucher.inventoryVoucherNumber ||
            voucher.voucher,

          pin:
            voucher.inventoryVoucherPin ||
            voucher.pin,

          validityTill:
            voucher.inventoryVoucherExpire ||
            voucher.validityTill,

          amount:
            voucher.selectedValue ||
            voucher.redeemedValue ||
            0,

          brandName:
            voucher.inventoryVoucherName ||
            voucher.brandName,

          brandLogo:
            voucher.inventoryVoucherLogoUrl || "",

          redemptionProcess:
            voucher.redemptionProcess || "",

          brandUrl:
            voucher.inventoryVoucherBrandUrl || "",

          companyName: "TruVish"
        }
      );

      // 🔥 SUCCESS MESSAGE SHOW
      setShowSuccess(true);

      // 🔥 CALLBACK
      if (onSuccess) {
        onSuccess();
      }

      // 🔥 CLEAR INPUTS
      setEmail("");
      setName("");

      // 🔥 AUTO HIDE + CLOSE
      setTimeout(() => {

        setShowSuccess(false);

        onClose();

      }, 2500);

    } catch (error) {

      console.log(error);

      alert(
        "Failed to send voucher email"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="share-overlay">

      {/* 🔥 TOP SUCCESS MESSAGE */}
      <div
        className={`top-success ${
          showSuccess ? "show-success" : ""
        }`}
      >
        <div className="success-icon">
          ✓
        </div>

        <div>
          <h4>Email Sent Successfully</h4>

          <p>
            Voucher delivered to recipient inbox
          </p>
        </div>
      </div>

      <div
        className="share-backdrop"
        onClick={onClose}
      ></div>

      <div className="share-sheet">

        <div className="sheet-line"></div>

        <div className="share-header">

          <h2>Share Voucher</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <IoClose />
          </button>

        </div>

        {/* EMAIL */}
        <div className="field-wrapper">

          <div className="label-row">
            <label>RECIPIENT EMAIL</label>
          </div>

          <div className="input-box">

            <MdOutlineMail />

            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

        </div>

        {/* NAME */}
        <div className="field-wrapper">

          <div className="label-row">
            <label>RECIPIENT NAME</label>
            <span>OPTIONAL</span>
          </div>

          <div className="input-box">

            <FiUser />

            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

        </div>

        {/* SEND BUTTON */}
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading}
        >

          <IoPaperPlaneOutline />

          {
            loading
              ? "Sending..."
              : "Send Now"
          }

        </button>

        <p className="share-info">
          Recipient will receive
          voucher details securely.
        </p>

      </div>

    </div>
  );
}