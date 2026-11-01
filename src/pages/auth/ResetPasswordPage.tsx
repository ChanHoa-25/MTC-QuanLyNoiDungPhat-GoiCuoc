import { message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router-dom";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField } from "../../components/auth/AuthForm";

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

  const handleSubmit = async () => {
    const token = searchParams.get("token");

    if (!token) {
      message.error("Liên kết đặt lại mật khẩu không hợp lệ!");
      return;
    }

    // TODO: Tích hợp API đặt lại mật khẩu
    // Gửi token và values.password đến backend
    message.info("API đặt lại mật khẩu chưa được kết nối.");
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
