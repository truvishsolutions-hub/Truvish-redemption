import React, { useState } from "react";
import EnterMobile from "./MobEnter/EnterMobile";
import VerifyOtp from "./VerifyOtp/VerifyOtp";
import TruvCod from "./CodeEnter/TruvCod";
import RedeemCard from "./RewardVal/RewardCard";
import ChooseReward from "./ChooseReward/ChooseReward";

const App = () => {
  // ✅ Current page state
  const [page, setPage] = useState("code");

  // ✅ User phone number
  const [phone, setPhone] = useState("");

  // ✅ If code already used, existing phone from backend
  const [existingPhone, setExistingPhone] = useState(null);

  // ✅ User entered TruVish code
  const [truvishCode, setTruvishCode] = useState(null);

  // ✅ Theme image from backend
  const [clientThemeImg, setClientThemeImg] = useState(null);

  // ✅ Reward data from backend
  const [rewardValue, setRewardValue] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);
  const [validity, setValidity] = useState(null);

  // ✅ NEW: Store client categories and brands
  const [clientCategories, setClientCategories] = useState([]);
  const [clientBrands, setClientBrands] = useState([]);

  return (
    <>
      {/* ---------------- STEP 1: ENTER CODE ---------------- */}
      {page === "code" && (
        <TruvCod
          onSuccess={(data) => {
            setExistingPhone(data.existingPhone || null);
            setRewardValue(data.value || null);
            setBrandLogo(data.clientImg || null);
            setValidity(data.validity || null);
            setClientThemeImg(data.clientThemeImg || null);

            // ✅ NEW: Store categories and brands
            setClientCategories(data.clientCategory || []);
            setClientBrands(data.clientBrand || []);

            setTruvishCode(data.code || null);

            setPage("mobile");
          }}
        />
      )}

      {/* ---------------- STEP 2: ENTER MOBILE ---------------- */}
      {page === "mobile" && (
        <EnterMobile
          existingPhone={existingPhone}
          onBack={() => setPage("code")}
          onSendOtp={(mobile) => {
            setPhone(mobile);
            setPage("otp");
          }}
        />
      )}

      {/* ---------------- STEP 3: VERIFY OTP ---------------- */}
      {page === "otp" && (
        <VerifyOtp
          phone={phone}
          onOtpVerified={() => setPage("redeem")}
          onChangeNumber={() => setPage("mobile")}
        />
      )}

      {/* ---------------- STEP 4: SHOW REWARD CARD ---------------- */}
      {page === "redeem" && (
        <RedeemCard
          phone={phone}
          rewardValue={rewardValue}
          brandLogo={brandLogo}
          clientThemeImg={clientThemeImg}
          validity={validity}
          onChooseReward={() => setPage("chooseReward")}
        />
      )}

      {/* ---------------- STEP 5: CHOOSE REWARD PAGE ---------------- */}
      {page === "chooseReward" && (
        <ChooseReward
          rewardValue={rewardValue}
          brandLogo={brandLogo}
          truvishCode={truvishCode}
          phone={phone}
          clientCategories={clientCategories}  // ✅ Pass categories
          clientBrands={clientBrands}          // ✅ Pass brands
          onBack={() => setPage("redeem")}
        />
      )}
    </>
  );
};

export default App;