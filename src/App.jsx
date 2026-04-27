import React, { useState } from "react";
import EnterMobile from "./MobEnter/EnterMobile";
import VerifyOtp from "./VerifyOtp/VerifyOtp";
import TruvCod from "./CodeEnter/TruvCod";
import RedeemCard from "./RewardVal/RewardCard";
import ChooseReward from "./ChooseReward/ChooseReward";
import RedemptionHistory from "./ChooseReward/RedemptionHistory";

const App = () => {
  const [page, setPage] = useState("code");
  const [phone, setPhone] = useState("");
  const [existingPhone, setExistingPhone] = useState(null);
  const [truvishCode, setTruvishCode] = useState(null);
  const [clientThemeImg, setClientThemeImg] = useState(null);
  const [rewardValue, setRewardValue] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);
  const [validity, setValidity] = useState(null);
  const [clientCategories, setClientCategories] = useState([]);
  const [clientBrands, setClientBrands] = useState([]);

  const resetFlowData = () => {
    setPhone("");
    setExistingPhone(null);
    setTruvishCode(null);
    setClientThemeImg(null);
    setRewardValue(null);
    setBrandLogo(null);
    setValidity(null);
    setClientCategories([]);
    setClientBrands([]);
  };

  const handleCodeSuccess = (data) => {
    setExistingPhone(data.existingPhone || null);
    setRewardValue(data.value || 0);
    setBrandLogo(data.clientImg || null);
    setValidity(data.validity || null);
    setClientThemeImg(data.clientThemeImg || null);
    setClientCategories(data.clientCategory || []);
    setClientBrands(data.clientBrand || []);
    setTruvishCode(data.code || null);
    setPage("mobile");
  };

  const handleBalanceUpdate = (newBalance) => {
    setRewardValue(Number(newBalance || 0));
  };

  return (
    <>
      {page === "code" && <TruvCod onSuccess={handleCodeSuccess} />}

      {page === "mobile" && (
        <EnterMobile
          existingPhone={existingPhone}
          onBack={() => {
            resetFlowData();
            setPage("code");
          }}
          onSendOtp={(mobile) => {
            setPhone(mobile);
            setPage("otp");
          }}
        />
      )}

      {page === "otp" && (
        <VerifyOtp
          phone={phone}
          onOtpVerified={() => setPage("redeem")}
          onChangeNumber={() => setPage("mobile")}
        />
      )}

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

      {page === "chooseReward" && (
        <ChooseReward
          rewardValue={rewardValue}
          brandLogo={brandLogo}
          truvishCode={truvishCode}
          phone={phone}
          clientCategories={clientCategories}
          clientBrands={clientBrands}
          onBalanceUpdate={handleBalanceUpdate}
          onBack={() => setPage("redeem")}
          onCodeHistory={() => setPage("history")}
        />
      )}

      {page === "history" && (
        <RedemptionHistory
          phone={phone}
          truvishCode={truvishCode}
          onBack={() => setPage("chooseReward")}
        />
      )}
    </>
  );
};

export default App;