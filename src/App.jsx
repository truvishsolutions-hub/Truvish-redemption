import React, { useState } from "react";
import EnterMobile from "./MobEnter/EnterMobile";
import VerifyOtp from "./VerifyOtp/VerifyOtp";
import TruvCod from "./CodeEnter/TruvCod";
import RedeemCard from "./RewardVal/RewardCard";
import ChooseReward from "./ChooseReward/ChooseReward";

const App = () => {

  // Current page state
  const [page, setPage] = useState("code");

  // User phone number
  const [phone, setPhone] = useState("");

  // If code already used → existing phone store hoga
  const [existingPhone, setExistingPhone] = useState(null);

  // User entered TRUVISH code
  const [truvishCode, setTruvishCode] = useState(null);

  // Theme values coming from API
  const [clientTheme, setClientTheme] = useState(null);
  const [clientThemeImg, setClientThemeImg] = useState(null);  // ⭐ Theme background image

  // Reward data
  const [rewardValue, setRewardValue] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);


  return (
    <>
      {/* ---------------- STEP 1: ENTER CODE ---------------- */}
      {page === "code" && (
        <TruvCod
          onSuccess={(data) => {

            // Code already used? → existing phone set
            setExistingPhone(data.existingPhone || null);

            // Reward Value + Brand Logo from backend
            setRewardValue(data.value);
            setBrandLogo(data.logoUrl);

            // Store the code for final redeem API
            setTruvishCode(data.code);

            // Theme data from backend
            setClientTheme(data.clientTheme);
            setClientThemeImg(data.clientThemeImg);   // ⭐ NEW UPDATE

            // Move to phone number page
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

          // ⭐ NOW PASSING THE THEME DATA
          clientTheme={clientTheme}
          clientThemeImg={clientThemeImg}

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
          onBack={() => setPage("redeem")}
        />
      )}
    </>
  );
};

export default App;
