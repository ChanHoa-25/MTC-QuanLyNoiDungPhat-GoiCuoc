import React from "react";
import { UserX, PhoneCall } from "lucide-react";
import AppModal from "../common/AppModal";
import AppButton from "../common/AppButton";

interface AccountSuspendedModalProps {
  open: boolean;
  onClose: () => void;
}

export const AccountSuspendedModal: React.FC<AccountSuspendedModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <AppModal open={open} onCancel={onClose} width={480} footer={null} title={null}>
      <div style={{ textAlign: "center", padding: "16px 8px 8px" }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#FFF1F0",
            color: "#F5222D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
          <UserX size={34} />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B2B2B", marginBottom: 8 }}>
          Tài khoản bị ngưng hoạt động
        </h3>

        <p style={{ color: "#595959", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Tài khoản của bạn đã bị ngưng hoạt động hoặc vô hiệu hóa bởi Quản trị viên hệ thống. Mọi
          quyền truy cập và phát bản tin đã bị tạm khóa.
        </p>

        <div
          style={{
            background: "#FAFAFA",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            color: "#595959",
            marginBottom: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}>
          <PhoneCall size={16} color="#F26D21" />
          <span>Hotline hỗ trợ kỹ thuật: <strong>1900 6868</strong></span>
        </div>

        <div>
          <AppButton variant="primary" width={140} onClick={onClose}>
            Xác nhận
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default AccountSuspendedModal;
