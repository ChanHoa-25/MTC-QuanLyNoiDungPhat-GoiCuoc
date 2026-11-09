import { Checkbox, Form, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField } from "../../components/auth/AuthForm";
import { ROUTES } from "../../constants/route.constants";

import "./LoginPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5006/api";

const fields: AuthField[] = [
  {
    name: "username",
    placeholder: "Tên đăng nhập",
    type: "text",
    requiredMessage: "Vui lòng nhập tên đăng nhập!",
    icon: <MailOutlined />,
  },
  {
    name: "password",
    placeholder: "Mật khẩu",
    type: "password",
    requiredMessage: "Vui lòng nhập mật khẩu!",
    icon: <LockOutlined />,
  },
];

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (values: Record<string, any>) => {
    try {
      const response = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username?.trim(),
          password: values.password,
          rememberMe: !!values.remember,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        localStorage.setItem("currentUser", JSON.stringify(result.data.user));

        message.success(result.message || "Đăng nhập thành công!");
        navigate(ROUTES.DASHBOARD);
      } else {
        message.error(result.message || "Tên đăng nhập hoặc mật khẩu không chính xác!");
      }
    } catch {
      message.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!");
    }
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
              <Checkbox>Ghi nhớ mật khẩu</Checkbox>
            </Form.Item>

            <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
        }
      />
    </div>
  );
}

export default LoginPage;
