import type { DashboardDevice } from "../../types/dashboard.types";
import "./DashboardDevicePopup.css";

interface DashboardDevicePopupProps {
  device: DashboardDevice;
}

const statusText = {
  online: "Đang hoạt động",
  offline: "Ngưng hoạt động",
};

function DashboardDevicePopup({ device }: DashboardDevicePopupProps) {
  return (
    <>
      <div className="device-popup__title">Thông tin thiết bị</div>

      <dl className="device-popup__list">
        <dt>Tên thiết bị:</dt>
        <dd>{device.name}</dd>

        <dt>Địa chỉ:</dt>
        <dd>{device.address}</dd>

        <dt>Tọa độ:</dt>
        <dd>
          {device.lat.toFixed(7)}, {device.lng.toFixed(7)}
        </dd>

        <dt>Trạng thái:</dt>
        <dd className="device-popup__status">
          <span
            className={`device-popup__dot device-popup__dot--${device.status}`}
          />

          {statusText[device.status]}
        </dd>
      </dl>
    </>
  );
}

export default DashboardDevicePopup;
