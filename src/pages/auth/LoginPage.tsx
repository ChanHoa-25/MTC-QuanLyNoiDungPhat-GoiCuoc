import { Checkbox, Form, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField, AuthFormValues } from "../../components/auth/AuthForm";

import { authApi } from "../../api/authApi";
import { authStorage } from "../../utils/authStorage";

import "./LoginPage.css";
import { ROUTES } from "../../constants/route.constants";

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
  const location = useLocation();

  const handleLogin = async (values: AuthFormValues) => {
    const username = String(values.username ?? "").trim();
    const password = String(values.password ?? "");
    const rememberMe = values.remember === true;

    try {
      const result = await authApi.login({
        username,
        password,
        rememberMe,
      });

      if (result.requires2FA) {
        if (!result.user?.userId) {
          message.error("Không nhận được thông tin xác thực 2FA.");
          return;
        }

        // Chưa lưu token khi chưa hoàn tất 2FA.
        navigate(ROUTES.VERIFY_2FA, {
          replace: true,
          state: {
            userId: result.user.userId,
            from: location.state?.from,
          },
        });

        return;
      }

      if (!result.accessToken || !result.refreshToken) {
        message.error("Không nhận được thông tin xác thực.");
        return;
      }

      authStorage.setTokens(result.accessToken, result.refreshToken);

      message.success("Đăng nhập thành công!");

      const from = location.state?.from;
      const redirectPath =
        typeof from?.pathname === "string" &&
        from.pathname.startsWith("/") &&
        !from.pathname.startsWith("//")
          ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
          : "/dashboard";

      navigate(redirectPath, { replace: true });
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
            <Form.Item
              name="remember"
              valuePropName="checked"
              initialValue={false}
              noStyle>
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
