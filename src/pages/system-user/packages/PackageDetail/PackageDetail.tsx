import { useParams } from "react-router-dom";

import { INITIAL_PACKAGE_GROUPS } from "../data/packages.mock";
import { PACKAGE_STATUS_LABELS } from "../types/package.types";
import type { PackageStatus } from "../types/package.types";

import "./PackageDetail.css";

interface DetailFieldProps {
  label: string;
  value: string | number;
}

const formatPrice = (price: number | null) =>
  price === null ? "—" : `${price.toLocaleString("vi-VN")} VND`;

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="package-detail-field">
      <span className="package-detail-field-label">{label}:</span>
      <span className="package-detail-field-value">{value}</span>
    </div>
  );
}

function PackageDetail() {
  const { id } = useParams<{ id: string }>();

  const group = INITIAL_PACKAGE_GROUPS.find((item) => item.id === id);

  if (!group) {
    return (
      <div className="package-detail-page">
        <h2 className="package-detail-title">Chi tiết gói cước</h2>
        <div className="package-detail-empty">
          Không tìm thấy nhóm gói cước.
        </div>
      </div>
    );
  }

  return (
    <div className="package-detail-page">
      <h2 className="package-detail-title">Chi tiết gói cước</h2>

      <div className="package-detail-capacity">
        <div className="package-detail-capacity-item">
          <span>Dung lượng:</span>
          <strong>{group.capacity}</strong>
        </div>

        <div className="package-detail-capacity-item">
          <span>Tên dung lượng:</span>
          <strong>{group.name}</strong>
        </div>
      </div>

      <div className="package-detail-packages">
        {group.packages.map((item) => (
          <div className="package-detail-info" key={item.id}>
            <DetailField label="Tên gói cước" value={item.name} />

            <DetailField label="Thời hạn" value={item.duration} />

            <DetailField label="Giá gói cước" value={formatPrice(item.price)} />

            <DetailField label="Giới hạn thiết bị" value={item.deviceLimit} />

            <DetailField label="Công khai gói cước" value={item.visibility} />

            <DetailField
              label="Số lượt đăng ký"
              value={item.registrations ?? "—"}
            />

            <DetailField
              label="Trạng thái"
              value={item.status ? PACKAGE_STATUS_LABELS[item.status] : "—"}
            />

            <DetailField label="Người tạo" value="—" />

            <DetailField label="Thời gian tạo" value={item.createdAt} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackageDetail;
