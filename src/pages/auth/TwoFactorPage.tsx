import { useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { authApi } from "../../api/authApi";
import { authStorage } from "../../utils/authStorage";
import { ROUTES } from "../../constants/route.constants";
import { usePermission } from "../../contexts/PermissionContext";

import "./TwoFactorPage.css";

interface TwoFactorLocationState {
  userId: string;
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

interface TwoFactorFormValues {
  code: string;
}

function TwoFactorPage() {
  const { refreshPermissions } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as TwoFactorLocationState | null;
  const userId = state?.userId;

  const [loading, setLoading] = useState(false);

  const isPreview =
    process.env.NODE_ENV === "development" &&
    new URLSearchParams(location.search).get("preview") === "true";

  const handleVerify = async (values: TwoFactorFormValues) => {
    if (loading) return;

    if (isPreview) {
      message.info("Chế độ xem trước: Không gọi API xác thực.");
      return;
    }

    if (!userId) {
      message.error("Phiên xác thực không hợp lệ. Vui lòng đăng nhập lại.");
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    try {
      setLoading(true);

      const result = await authApi.verify2FA({
        userId,
        code: values.code,
      });

      if (result.requires2FA) {
        message.error("Tài khoản chưa hoàn tất xác thực.");
        return;
      }

      if (!result.accessToken || !result.refreshToken) {
        message.error("Backend không trả về token xác thực.");
        return;
      }

      authStorage.setTokens(result.accessToken, result.refreshToken);

      // Cập nhật quyền sau khi hoàn tất xác thực 2FA
      await refreshPermissions();

      message.success("Xác thực thành công!");

      const from = state?.from;

      const redirectPath =
        typeof from?.pathname === "string" &&
        from.pathname.startsWith("/") &&
        !from.pathname.startsWith("//") &&
        from.pathname !== ROUTES.LOGIN &&
        from.pathname !== ROUTES.VERIFY_2FA
          ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
          : ROUTES.DASHBOARD;

      navigate(redirectPath, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(
          error.response?.data?.message ||
            "Mã xác thực không hợp lệ hoặc đã hết hạn.",
        );
      } else {
        message.error(
          error instanceof Error ? error.message : "Xác thực thất bại.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userId && !isPreview) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="two-factor-page">
      <div className="two-factor-heading">
        <h1>Xác thực hai bước</h1>
        <p>Vui lòng nhập mã xác thực 6 chữ số của bạn</p>
      </div>

      <Form<TwoFactorFormValues>
        layout="vertical"
        requiredMark={false}
        onFinish={handleVerify}
        className="two-factor-form">
        <Form.Item
          name="code"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mã xác thực!",
            },
            {
              pattern: /^\d{6}$/,
              message: "Mã xác thực phải gồm 6 chữ số!",
            },
          ]}>
          <Input.OTP
            length={6}
            size="large"
            inputMode="numeric"
            formatter={(value) => value.replace(/\D/g, "")}
            disabled={loading}
          />
        </Form.Item>

        <div className="two-factor-remember">
          <Checkbox disabled>Không hỏi lại trên thiết bị này</Checkbox>
        </div>

        <Form.Item className="two-factor-submit">
          <Button type="primary" htmlType="submit" loading={loading} block>
            Xác nhận
          </Button>
        </Form.Item>

        <div className="two-factor-alternative">
          <span title="Chức năng đang chờ tích hợp Backend">Thử cách khác</span>
        </div>
      </Form>

      <Link to={ROUTES.LOGIN} className="two-factor-back">
        Quay lại trang đăng nhập
      </Link>
    </div>
  );
}

export default TwoFactorPage;
