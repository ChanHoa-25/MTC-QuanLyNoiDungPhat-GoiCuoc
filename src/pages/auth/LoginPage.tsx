import { Checkbox, Form, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import AuthForm from "../../components/auth/AuthForm";
import type { AuthField } from "../../components/auth/AuthForm";

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

function LoginPage() {
  const handleLogin = async (values: Record<string, string>) => {
    // TODO: Tích hợp API đăng nhập.
    // Không in mật khẩu ra console.
    void values;

    message.info("API đăng nhập chưa được kết nối.");
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
