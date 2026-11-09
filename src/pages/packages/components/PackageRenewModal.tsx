import React, { useState } from "react";
import { Radio, message, Divider } from "antd";
import { RefreshCw, CreditCard, Building, Smartphone } from "lucide-react";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import { usePackages } from "../../../contexts/PackageContext";
import { useAuth } from "../../../contexts/AuthContext";
import type { PaymentMethod } from "../../../types/package.types";

interface PackageRenewModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PackageRenewModal: React.FC<PackageRenewModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { user, renewCurrentSubscription } = useAuth();
  const { packages, processRenew } = usePackages();

  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [loading, setLoading] = useState(false);

  const currentPkg =
    packages.find((p) => p.id === user.currentPackage.id) || packages[2] || packages[0];

  // Tính chi phí
  const calculateTotal = () => {
    if (selectedMonths === 12) {
      return currentPkg.durationMonths === 12 ? currentPkg.priceVND : currentPkg.priceVND * 10;
    }
    return (currentPkg.priceVND / (currentPkg.durationMonths || 1)) * selectedMonths;
  };

  const totalAmount = calculateTotal();

  const handleConfirmRenew = () => {
    setLoading(true);

    setTimeout(() => {
      processRenew(currentPkg.id, selectedMonths, paymentMethod, user.orgName);

      // Tính ngày hết hạn mới
      const [day, month, year] = user.currentPackage.expirationDate.split("/").map(Number);
      const currentExpiry = new Date(year, month - 1, day);
      currentExpiry.setMonth(currentExpiry.getMonth() + selectedMonths);
      const newExpiryStr = `${String(currentExpiry.getDate()).padStart(2, "0")}/${String(
        currentExpiry.getMonth() + 1,
      ).padStart(2, "0")}/${currentExpiry.getFullYear()}`;

      renewCurrentSubscription(selectedMonths, newExpiryStr);
      setLoading(false);
      message.success(
        `Gia hạn thành công gói [${currentPkg.name}] thêm ${selectedMonths} tháng! Hạn mới: ${newExpiryStr}`,
      );
      onClose();
      onSuccess?.();
    }, 600);
  };

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={580}
      title="Gia hạn gói cước dịch vụ"
      footer={null}>
      <div style={{ paddingTop: 8 }}>
        {/* Thông tin gói hiện tại */}
        <div
          style={{
            background: "#FFFBF8",
            border: "1px solid #FFE7D6",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 20,
          }}>
          <div style={{ fontSize: 13, color: "#8C8C8C", marginBottom: 2 }}>Gói cước đang sử dụng:</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#F26D21" }}>
            {currentPkg.name} ({currentPkg.storageGB} GB • Tối đa {currentPkg.maxDevices} thiết bị)
          </div>
          <div style={{ fontSize: 13, color: "#595959", marginTop: 4 }}>
            Hạn hiện tại: <strong>{user.currentPackage.expirationDate}</strong>
          </div>
        </div>

        {/* Chọn thời gian gia hạn */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: "#2B2B2B", marginBottom: 10 }}>
            Chọn chu kỳ gia hạn:
          </div>
          <Radio.Group
            value={selectedMonths}
            onChange={(e) => setSelectedMonths(e.target.value)}
            style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Radio.Button
              value={1}
              style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
              1 tháng
            </Radio.Button>
            <Radio.Button
              value={3}
              style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
              3 tháng (1 Quý)
            </Radio.Button>
            <Radio.Button
              value={6}
              style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
              6 tháng (Nửa năm)
            </Radio.Button>
            <Radio.Button
              value={12}
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderColor: "#F26D21",
                fontWeight: 600,
              }}>
              12 tháng (1 Năm - Tiết kiệm 20%)
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Phương thức thanh toán */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: "#2B2B2B", marginBottom: 10 }}>
            Phương thức thanh toán:
          </div>
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <Radio
              value="bank_transfer"
              style={{
                border: "1px solid #E8E8E8",
                padding: "10px 14px",
                borderRadius: 8,
                width: "100%",
                margin: 0,
              }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Building size={16} color="#1890FF" /> Chuyển khoản ngân hàng (Ủy nhiệm chi / VietQR)
              </div>
            </Radio>
            <Radio
              value="credit_card"
              style={{
                border: "1px solid #E8E8E8",
                padding: "10px 14px",
                borderRadius: 8,
                width: "100%",
                margin: 0,
              }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <CreditCard size={16} color="#722ED1" /> Thẻ thanh toán quốc tế (Visa / Mastercard)
              </div>
            </Radio>
            <Radio
              value="momo"
              style={{
                border: "1px solid #E8E8E8",
                padding: "10px 14px",
                borderRadius: 8,
                width: "100%",
                margin: 0,
              }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Smartphone size={16} color="#E91E63" /> Ví điện tử MoMo
              </div>
            </Radio>
          </Radio.Group>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* Tổng tiền */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}>
          <span style={{ fontSize: 14, color: "#595959" }}>Tổng tiền thanh toán:</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#F26D21" }}>
            {totalAmount.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <AppButton variant="outline" width={110} onClick={onClose} disabled={loading}>
            Hủy
          </AppButton>
          <AppButton
            variant="primary"
            width={170}
            onClick={handleConfirmRenew}
            loading={loading}
            icon={<RefreshCw size={16} />}>
            Xác nhận gia hạn
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default PackageRenewModal;
