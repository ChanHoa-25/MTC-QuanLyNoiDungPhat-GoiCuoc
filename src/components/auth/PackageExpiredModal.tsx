import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import AppModal from "../common/AppModal";
import AppButton from "../common/AppButton";

interface PackageExpiredModalProps {
  open: boolean;
  onClose: () => void;
  onRenew: () => void;
  packageName?: string;
  expiredDate?: string;
}

export const PackageExpiredModal: React.FC<PackageExpiredModalProps> = ({
  open,
  onClose,
  onRenew,
  packageName = "Gói Tiêu chuẩn 20GB",
  expiredDate = "28/10/2026",
}) => {
  return (
    <AppModal open={open} onCancel={onClose} width={500} footer={null} title={null}>
      <div style={{ textAlign: "center", padding: "16px 8px 8px" }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#FFF2E8",
            color: "#FA541C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
          <AlertTriangle size={34} />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B2B2B", marginBottom: 8 }}>
          Gói cước đã hết hạn sử dụng!
        </h3>

        <p style={{ color: "#595959", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Gói cước <strong>[{packageName}]</strong> của cơ sở đã hết hạn vào ngày{" "}
          <strong style={{ color: "#FA541C" }}>{expiredDate}</strong>. Hệ thống đã tạm dừng
          tính năng phát bản tin và phân phối media mới cho đến khi gói cước được gia hạn.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <AppButton variant="outline" width={120} onClick={onClose}>
            Đóng
          </AppButton>
          <AppButton
            variant="primary"
            width={160}
            onClick={onRenew}
            icon={<RefreshCw size={16} />}>
            Gia hạn ngay
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default PackageExpiredModal;
