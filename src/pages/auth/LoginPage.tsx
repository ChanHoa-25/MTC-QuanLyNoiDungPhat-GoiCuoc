import { Checkbox, Form, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField } from "../../components/auth/AuthForm";

import { authApi } from "../../api/authApi";
import { authStorage } from "../../utils/authStorage";

import "./LoginPage.css";

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

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (values: Record<string, string>) => {
    const formValues = values as unknown as LoginFormValues;

    try {
      const result = await authApi.login({
        username: formValues.username.trim(),
        password: formValues.password,
        rememberMe: Boolean(formValues.remember),
      });

      if (result.requires2FA) {
        message.info("Tài khoản yêu cầu xác thực hai bước.");
        return;
      }

      if (!result.accessToken || !result.refreshToken) {
        message.error("Không nhận được thông tin xác thực.");
        return;
      }

      authStorage.setTokens(result.accessToken, result.refreshToken);

      message.success("Đăng nhập thành công!");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Không thể kết nối đến máy chủ.";

        message.error(errorMessage);
      } else {
        message.error(
          error instanceof Error ? error.message : "Đăng nhập thất bại.",
        );
      }
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

            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
        }
      />
    </div>
  );
}

export default LoginPage;
