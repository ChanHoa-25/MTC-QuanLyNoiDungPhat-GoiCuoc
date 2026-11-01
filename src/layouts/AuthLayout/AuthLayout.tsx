import { Outlet } from "react-router-dom";

import AppLanguage from "../../components/common/AppLanguage/AppLanguage";

import Logo from "../../assets/images/Logo.png";
import loginBackground from "../../assets/images/login-background.png";

import "./AuthLayout.css";

function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Khu vực bên trái */}
      <div className="auth-layout__left">
        {/* Chọn ngôn ngữ */}
        <div className="auth-layout__language">
          <AppLanguage />
        </div>

        {/* Logo và nội dung xác thực */}
        <div className="auth-layout__content">
          <div className="auth-layout__brand">
            <img src={Logo} alt="MTC Logo" className="auth-layout__logo" />

            <h2 className="auth-layout__brand-name">
              Multimedia Terminal Controller
            </h2>
          </div>

          {/* LoginPage / ForgotPasswordPage / ResetPasswordPage */}
          <div className="auth-layout__form">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Khu vực bên phải */}
      <div className="auth-layout__right">
        <img
          src={loginBackground}
          alt="Minh họa hệ thống MTC"
          className="auth-layout__illustration"
        />
      </div>
    </div>
  );
}

export default AuthLayout;
