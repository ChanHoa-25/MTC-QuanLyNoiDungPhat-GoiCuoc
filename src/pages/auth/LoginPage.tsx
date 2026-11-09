import { useState } from "react";
import { Checkbox, Form, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField } from "../../components/auth/AuthForm";
import { useAuth } from "../../contexts/AuthContext";
import FirstLoginModal from "../../components/auth/FirstLoginModal";
import TwoFactorSetupModal from "../../components/auth/TwoFactorSetupModal";
import AccountSuspendedModal from "../../components/auth/AccountSuspendedModal";
import { ROUTES } from "../../constants/route.constants";

import "./LoginPage.css";

const fields: AuthField[] = [
  {
    name: "username",
    placeholder: "Tên đăng nhập (admin / tv2 / suspended)",
    type: "text",
    requiredMessage: "Vui lòng nhập tên đăng nhập!",
    icon: <UserOutlined />,
  },
  {
    name: "password",
    placeholder: "Mật khẩu (tối thiểu 6 ký tự, vd: 123456)",
    type: "password",
    requiredMessage: "Vui lòng nhập mật khẩu!",
    icon: <LockOutlined />,
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, dismissFirstLogin } = useAuth();

  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);

  const handleLogin = async (values: Record<string, string>) => {
    const { username, password } = values;

    if (username.trim().toLowerCase() === "suspended") {
      setShowSuspended(true);
      return;
    }

    const res = login(username, password);
    if (!res.success) {
      message.error(res.message);
      return;
    }

    message.success(res.message);

    if (res.isFirstLogin) {
      setShowFirstLogin(true);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const handleDismissFirstLogin = () => {
    setShowFirstLogin(false);
    dismissFirstLogin();
    navigate(ROUTES.DASHBOARD);
  };

  const handleGoToSettings = () => {
    setShowFirstLogin(false);
    dismissFirstLogin();
    setShow2FA(true);
  };

  const handleFinish2FA = () => {
    setShow2FA(false);
    navigate(ROUTES.SETTINGS_PERSONAL);
  };

  return (
    <div className="login-page">
      <AuthForm
        title="Đăng nhập"
        fields={fields}
        buttonText="Đăng nhập"
        onSubmit={handleLogin}
        footer={
          <div className="login-options">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox defaultChecked>Ghi nhớ mật khẩu</Checkbox>
            </Form.Item>

            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
        }
      />

      {/* Pop-up khuyến nghị 2FA & đổi mật khẩu cho lần đầu đăng nhập theo SRS */}
      <FirstLoginModal
        open={showFirstLogin}
        onDismiss={handleDismissFirstLogin}
        onGoToSettings={handleGoToSettings}
      />

      {/* Modal thiết lập 2FA */}
      <TwoFactorSetupModal open={show2FA} onClose={handleFinish2FA} />

      {/* Modal tài khoản bị ngưng hoạt động */}
      <AccountSuspendedModal open={showSuspended} onClose={() => setShowSuspended(false)} />
    </div>
  );
}

export default LoginPage;
