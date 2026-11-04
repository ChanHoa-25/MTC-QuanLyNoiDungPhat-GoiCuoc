import { SquarePen } from "lucide-react";

import AppStatusTag from "../../../../components/common/AppStatusTag";
import AppIconButton from "../../../../components/common/AppIconButton";

import type { Device } from "../../types/device.types";

import "./DeviceInfo.css";

interface DeviceInfoProps {
  device: Device;
  onEdit?: () => void;
}

function DeviceInfo({ device, onEdit }: DeviceInfoProps) {
  return (
    <section className="device-info">
      {/* Header */}
      <div className="device-info__header">
        <h2 className="device-info__title">Thông tin thiết bị</h2>

        <AppIconButton
          icon={<SquarePen />}
          tooltip="Chỉnh sửa thiết bị"
          size={40}
          iconSize={22}
          onClick={onEdit}
        />
      </div>

      {/* Danh sách thông tin */}
      <div className="device-info__list">
        <div className="device-info__row">
          <span>Tên thiết bị:</span>
          <span>{device.name}</span>
        </div>

        <div className="device-info__row">
          <span>Mã định danh thiết bị:</span>
          <span>{device.code}</span>
        </div>

        <div className="device-info__row">
          <span>Cơ sở quản lý:</span>
          <span>{device.facilityName}</span>
        </div>

        <div className="device-info__row">
          <span>Kinh độ:</span>
          <span>{device.longitude ?? "—"}</span>
        </div>

        <div className="device-info__row">
          <span>Vĩ độ:</span>
          <span>{device.latitude ?? "—"}</span>
        </div>

        <div className="device-info__row">
          <span>Địa chỉ:</span>
          <span>{device.location || "—"}</span>
        </div>

        <div className="device-info__row">
          <span>Số thuê bao SIM:</span>
          <span>{device.simPhone ?? "—"}</span>
        </div>

        <div className="device-info__row">
          <span>Số seri SIM:</span>
          <span>{device.simSerial ?? "—"}</span>
        </div>

        <div className="device-info__row">
          <span>Nhà cung cấp:</span>
          <span>{device.supplier}</span>
        </div>

        <div className="device-info__row">
          <span>Số điện thoại nhà cung cấp:</span>
          <span>{device.supplierPhone ?? "—"}</span>
        </div>

        <div className="device-info__row">
          <span>Trạng thái hoạt động:</span>
          <AppStatusTag
            variant={device.status === "active" ? "green" : "red"}
            label={
              device.status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"
            }
          />
        </div>

        <div className="device-info__row">
          <span>Trạng thái kết nối:</span>
          <AppStatusTag
            variant={device.connection === "online" ? "green" : "red"}
            label={
              device.connection === "online" ? "Đang kết nối" : "Mất kết nối"
            }
          />
        </div>

        <div className="device-info__row">
          <span>Trạng thái phát:</span>
          <AppStatusTag
            variant={device.broadcast === "playing" ? "green" : "red"}
            label={
              device.broadcast === "playing"
                ? "Đang phát bản tin"
                : "Dừng phát bản tin"
            }
          />
        </div>

        <div className="device-info__row">
          <span>Mô tả:</span>
          <span>{device.description ?? "—"}</span>
        </div>
      </div>
    </section>
  );
}

export default DeviceInfo;
