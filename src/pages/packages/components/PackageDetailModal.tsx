import React from "react";
import { Tag, Divider, Typography } from "antd";
import { Package, HardDrive, Radio, Calendar, CheckCircle2, Building2 } from "lucide-react";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import AppStatusTag from "../../../components/common/AppStatusTag";
import type { ServicePackage } from "../../../types/package.types";

const { Text } = Typography;

interface PackageDetailModalProps {
  open: boolean;
  onClose: () => void;
  packageData: ServicePackage | null;
  onEdit?: (pkg: ServicePackage) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  open,
  onClose,
  packageData,
  onEdit,
}) => {
  if (!packageData) return null;

  const getStatusVariant = (status: ServicePackage["status"]) => {
    switch (status) {
      case "active":
        return { variant: "green" as const, label: "Đang kinh doanh" };
      case "upcoming":
        return { variant: "blue" as const, label: "Chưa kinh doanh" };
      case "suspended":
        return { variant: "yellow" as const, label: "Ngưng kinh doanh" };
      case "ended":
        return { variant: "gray" as const, label: "Đã kết thúc" };
    }
  };

  const statusInfo = getStatusVariant(packageData.status);

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={640}
      title="Chi tiết gói cước dịch vụ"
      footer={null}>
      <div style={{ paddingTop: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Package size={22} color="#F26D21" />
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#2B2B2B" }}>
                {packageData.name}
              </h3>
            </div>
            <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: "block" }}>
              Mã gói: <Text code>{packageData.code}</Text> • ID: <Text code>{packageData.id}</Text>
            </Text>
          </div>

          <AppStatusTag variant={statusInfo.variant} label={statusInfo.label} />
        </div>

        <p style={{ color: "#595959", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {packageData.description}
        </p>

        {/* Thông số kỹ thuật */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
            background: "#FAFAFA",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
          }}>
          <div>
            <div style={{ fontSize: 12, color: "#8C8C8C", display: "flex", alignItems: "center", gap: 6 }}>
              <HardDrive size={14} color="#1890FF" /> Dung lượng
            </div>
            <strong style={{ fontSize: 16, color: "#1890FF" }}>{packageData.storageGB} GB</strong>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#8C8C8C", display: "flex", alignItems: "center", gap: 6 }}>
              <Radio size={14} color="#722ED1" /> Số thiết bị
            </div>
            <strong style={{ fontSize: 16, color: "#722ED1" }}>{packageData.maxDevices} máy</strong>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#8C8C8C", display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={14} color="#52C41A" /> Thời hạn
            </div>
            <strong style={{ fontSize: 16, color: "#52C41A" }}>
              {packageData.durationMonths === 12 ? "1 năm" : `${packageData.durationMonths} tháng`}
            </strong>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#8C8C8C" }}>Đơn giá gói</div>
            <strong style={{ fontSize: 16, color: "#F26D21" }}>
              {packageData.priceVND === 0
                ? "Miễn phí"
                : `${packageData.priceVND.toLocaleString("vi-VN")} đ`}
            </strong>
          </div>
        </div>

        {/* Khách hàng đang dùng */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FFFBF8",
            border: "1px solid #FFE7D6",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 size={20} color="#F26D21" />
            <div>
              <div style={{ fontWeight: 600, color: "#2B2B2B" }}>Thuê bao đang sử dụng</div>
              <div style={{ fontSize: 12, color: "#8C8C8C" }}>
                Số lượng cơ sở / tổ chức đang kích hoạt gói này
              </div>
            </div>
          </div>
          <Tag color="orange" style={{ fontSize: 14, fontWeight: 700, padding: "4px 12px" }}>
            {packageData.activeSubscribers} cơ sở
          </Tag>
        </div>

        {/* Danh sách tính năng */}
        {packageData.features && packageData.features.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#2B2B2B" }}>
              Tính năng bao gồm trong gói:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
              {packageData.features.map((feat, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#595959" }}>
                  <CheckCircle2 size={15} color="#52C41A" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Divider style={{ margin: "20px 0 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#8C8C8C" }}>
            Ngày tạo: {packageData.createdAt} • Cập nhật: {packageData.updatedAt}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <AppButton variant="outline" width={100} onClick={onClose}>
              Đóng
            </AppButton>
            {onEdit && (
              <AppButton
                variant="primary"
                width={120}
                onClick={() => {
                  onClose();
                  onEdit(packageData);
                }}>
                Chỉnh sửa
              </AppButton>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default PackageDetailModal;
