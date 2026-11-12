import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import AppHeader from "../components/AppHeader";
import Logo from "../../assets/images/Logo.png";

import "./AccountLayout.css";

const PAGE_TITLES: Record<string, string> = {
  "/account": "Tài khoản và cài đặt",
  "/account/two-factor": "Xác thực hai bước",
  "/account/two-factor/authenticator": "Ứng dụng xác thực",
  "/account/two-factor/recovery-codes": "Mã dự phòng",
};

function AccountLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const title = PAGE_TITLES[pathname] ?? "Tài khoản và cài đặt";
  const isAccountPage = pathname === "/account";

  const handleBack = () => {
    switch (pathname) {
      case "/account":
        navigate("/dashboard");
        break;

      case "/account/two-factor":
        navigate("/account", {
          state: { activeTab: "security" },
        });
        break;

      default:
        navigate("/account/two-factor");
        break;
    }
  };

  return (
    <div
      className={[
        "account-layout",
        isAccountPage ? "account-layout--account" : "account-layout--details",
      ].join(" ")}>
      <header className="account-layout__header">
        <img src={Logo} alt="MTC" className="account-layout__logo" />

        <div className="account-layout__header-right">
          <AppHeader variant="profile" />
        </div>
      </header>

      <div className="account-layout__heading">
        <button
          type="button"
          className="account-layout__back"
          onClick={handleBack}
          aria-label="Quay lại">
          <ChevronLeft size={24} />
        </button>

        <h1>{title}</h1>

        <div className="account-layout__underline" />
      </div>

      <main className="account-layout__content">
        <Outlet />
      </main>

      <footer className="account-layout__footer">
        Powered by AltaSoftware
      </footer>
    </div>
  );
}

export default AccountLayout;
