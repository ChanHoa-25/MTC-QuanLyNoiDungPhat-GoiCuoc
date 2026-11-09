import React, { useState } from "react";
import { Radio, message, Divider, Tag } from "antd";
import { PlusCircle, HardDrive, Radio as RadioIcon, CreditCard, Building, Smartphone } from "lucide-react";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import { usePackages } from "../../../contexts/PackageContext";
import { useAuth } from "../../../contexts/AuthContext";
import type { PaymentMethod, UpgradePackage } from "../../../types/package.types";

interface PackageUpgradeModalCustomerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PackageUpgradeModalCustomer: React.FC<PackageUpgradeModalCustomerProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { upgradePackages, processUpgrade } = usePackages();

  const availableUpgrades = upgradePackages.filter((u) => u.status === "selling");
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>(
    availableUpgrades[0]?.id || "",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [loading, setLoading] = useState(false);

  const selectedUpgrade =
    availableUpgrades.find((u) => u.id === selectedUpgradeId) || availableUpgrades[0];

  const handleConfirmUpgrade = () => {
    if (!selectedUpgrade) return;
    setLoading(true);

    setTimeout(() => {
      processUpgrade(selectedUpgrade.id, paymentMethod, user.orgName);
      setLoading(false);
      message.success(
        `Nâng cấp thành công gói [${selectedUpgrade.name}]! Tài nguyên đã được cộng vào tài khoản.`,
      );
      onClose();
      onSuccess?.();
    }, 600);
  };

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={620}
      title="Mua thêm dung lượng & thiết bị (Gói nâng cấp)"
      footer={null}>
      <div style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 13, color: "#595959", marginBottom: 16 }}>
          Mở rộng tài nguyên cho cơ sở <strong>[{user.orgName}]</strong> mà không cần đổi gói chính.
        </p>

        {/* Danh sách gói nâng cấp */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: "#2B2B2B", marginBottom: 10 }}>
            Chọn gói nâng cấp bổ sung:
          </div>

          <Radio.Group
            value={selectedUpgradeId}
            onChange={(e) => setSelectedUpgradeId(e.target.value)}
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            {availableUpgrades.map((pkg: UpgradePackage) => (
              <Radio
                key={pkg.id}
                value={pkg.id}
                style={{
                  border:
                    selectedUpgradeId === pkg.id ? "1.5px solid #F26D21" : "1px solid #E8E8E8",
                  padding: "12px 16px",
                  borderRadius: 8,
                  width: "100%",
                  margin: 0,
                  background: selectedUpgradeId === pkg.id ? "#FFFBF8" : "#FFFFFF",
                }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#2B2B2B", fontSize: 14 }}>
                      {pkg.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#8C8C8C", marginTop: 2 }}>
                      {pkg.description}
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                      {pkg.extraStorageGB > 0 && (
                        <Tag color="blue" icon={<HardDrive size={12} />}>
                          +{pkg.extraStorageGB} GB Dung lượng
                        </Tag>
                      )}
                      {pkg.extraDevices > 0 && (
                        <Tag color="purple" icon={<RadioIcon size={12} />}>
                          +{pkg.extraDevices} Thiết bị
                        </Tag>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#F26D21", marginLeft: 16 }}>
                    {pkg.priceVND.toLocaleString("vi-VN")} đ
                  </div>
                </div>
              </Radio>
            ))}
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
            style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Radio.Button
              value="bank_transfer"
              style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building size={14} style={{ marginRight: 6 }} /> Chuyển khoản
            </Radio.Button>
            <Radio.Button
              value="credit_card"
              style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={14} style={{ marginRight: 6 }} /> Thẻ quốc tế
            </Radio.Button>
            <Radio.Button
              value="momo"
              style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Smartphone size={14} style={{ marginRight: 6 }} /> Ví MoMo
            </Radio.Button>
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
          <span style={{ fontSize: 14, color: "#595959" }}>Số tiền thanh toán:</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#F26D21" }}>
            {selectedUpgrade ? `${selectedUpgrade.priceVND.toLocaleString("vi-VN")} đ` : "0 đ"}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <AppButton variant="outline" width={110} onClick={onClose} disabled={loading}>
            Hủy
          </AppButton>
          <AppButton
            variant="primary"
            width={160}
            onClick={handleConfirmUpgrade}
            loading={loading}
            icon={<PlusCircle size={16} />}>
            Thanh toán ngay
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default PackageUpgradeModalCustomer;
