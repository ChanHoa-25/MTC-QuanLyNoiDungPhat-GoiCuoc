import React from "react";
import { ShieldAlert, ArrowRight, X } from "lucide-react";
import AppModal from "../common/AppModal";
import AppButton from "../common/AppButton";

interface FirstLoginModalProps {
  open: boolean;
  onDismiss: () => void;
  onGoToSettings: () => void;
}

export const FirstLoginModal: React.FC<FirstLoginModalProps> = ({
  open,
  onDismiss,
  onGoToSettings,
}) => {
  return (
    <AppModal
      open={open}
      onCancel={onDismiss}
      width={520}
      footer={null}
      closable={true}
      title={null}>
      <div style={{ textAlign: "center", padding: "12px 8px 8px" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#FFF1E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "#F26D21",
          }}>
          <ShieldAlert size={36} strokeWidth={2.2} />
        </div>

        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#2B2B2B",
            marginBottom: 12,
          }}>
          Khuyến nghị bảo mật cho lần đăng nhập đầu tiên
        </h3>

        <p
          style={{
            fontSize: 14,
            color: "#595959",
            lineHeight: 1.6,
            marginBottom: 24,
            padding: "0 12px",
          }}>
          Chào mừng bạn đến với hệ thống <strong>MTC CMS</strong>. Nhằm tăng cường an toàn
          thông tin và bảo vệ tài khoản quản trị, hệ thống khuyến nghị bạn nên kích hoạt{" "}
          <strong>Xác thực hai bước (2FA)</strong> và thay đổi mật khẩu mặc định ngay bây giờ.
        </p>

        <div
          style={{
            background: "#FFFBF8",
            border: "1px dashed #F26D21",
            borderRadius: 8,
            padding: "12px 16px",
            textAlign: "left",
            marginBottom: 28,
            fontSize: 13,
            color: "#666",
          }}>
          <div style={{ fontWeight: 600, color: "#F26D21", marginBottom: 4 }}>
            Lợi ích khi thiết lập:
          </div>
          <div>• Ngăn chặn truy cập trái phép ngay cả khi lộ mật khẩu</div>
          <div>• Nhận thông báo xác thực qua ứng dụng Authenticator khi đăng nhập</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}>
          <AppButton
            variant="outline"
            width={160}
            height={40}
            onClick={onDismiss}
            icon={<X size={16} />}>
            Bỏ qua
          </AppButton>

          <AppButton
            variant="primary"
            width={180}
            height={40}
            onClick={onGoToSettings}
            icon={<ArrowRight size={16} />}>
            Đi tới cài đặt
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default FirstLoginModal;
