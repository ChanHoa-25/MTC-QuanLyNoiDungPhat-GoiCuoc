import { Link } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField, AuthFormValues } from "../../components/auth/AuthForm";

import "./ForgotPasswordPage.css";

const forgotPasswordFields: AuthField[] = [
  {
    name: "email",
    placeholder: "Nhập email của bạn",
    type: "email",
    requiredMessage: "Vui lòng nhập email!",
    icon: <MailOutlined />,
  },
];

function ForgotPasswordPage() {
  const handleForgotPassword = async (values: AuthFormValues) => {
    const email = String(values.email ?? "").trim();

    // TODO: Tích hợp API gửi yêu cầu đặt lại mật khẩu.
    console.log("Email yêu cầu đặt lại mật khẩu:", email);
  };

  return (
    <div className="forgot-password-page">
      <AuthForm
        title="Quên mật khẩu"
        description="Vui lòng nhập email để đặt lại mật khẩu"
        fields={forgotPasswordFields}
        buttonText="Gửi yêu cầu"
        onSubmit={handleForgotPassword}
        footer={<Link to="/login">Quay lại đăng nhập</Link>}
      />
    </div>
  );
}

export default ForgotPasswordPage;
