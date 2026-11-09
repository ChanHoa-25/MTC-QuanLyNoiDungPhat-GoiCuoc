import { message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField } from "../../components/auth/AuthForm";
import { ROUTES } from "../../constants/route.constants";

const fields: AuthField[] = [
  {
    name: "password",
    placeholder: "Mật khẩu mới",
    type: "password",
    requiredMessage: "Vui lòng nhập mật khẩu mới!",
    icon: <LockOutlined />,
    rules: [
      {
        min: 8,
        message: "Mật khẩu phải có ít nhất 8 ký tự!",
      },
    ],
  },
  {
    name: "confirmPassword",
    placeholder: "Xác nhận mật khẩu",
    type: "password",
    requiredMessage: "Vui lòng xác nhận mật khẩu!",
    icon: <LockOutlined />,
    confirmWith: "password",
  },
];

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (values: Record<string, string>) => {
    void values;
    const token = searchParams.get("token") || "mock-token";

    if (!token) {
      message.error("Liên kết đặt lại mật khẩu không hợp lệ!");
      return;
    }

    message.success("Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...");
    setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, 1200);
  };

  return (
    <div className="reset-password-page">
      <AuthForm
        title="Đặt lại mật khẩu"
        fields={fields}
        buttonText="Xác nhận"
        onSubmit={handleSubmit}
        footer={<Link to="/login">Quay lại đăng nhập</Link>}
      />
    </div>
  );
}

export default ResetPasswordPage;
