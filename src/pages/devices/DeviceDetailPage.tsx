import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "../../constants/route.constants";

import { useDevices } from "../../contexts/DeviceContext";

import AppButton from "../../components/common/AppButton";
import AppTabs from "../../components/common/AppTabs";
import type { AppTabItem } from "../../components/common/AppTabs";

import DeviceInfo from "./components/DeviceInfo/DeviceInfo";
import DeviceSchedule from "./components/DeviceSchedule";
import DeviceBroadcastHistory from "./components/DeviceBroadcastHistory";
import DeviceActivityHistory from "./components/DeviceActivityHistory";

import "./DeviceDetailPage.css";

// Kiểu dữ liệu các tab
type DeviceDetailTab = "info" | "broadcast-history" | "activity-history";

// Danh sách tab
const tabItems: AppTabItem[] = [
  {
    key: "info",
    label: "Thông tin thiết bị",
  },
  {
    key: "broadcast-history",
    label: "Lịch sử phát bản tin",
  },
  {
    key: "activity-history",
    label: "Lịch sử hoạt động của thiết bị",
  },
];

// Kiểm tra key tab hợp lệ
function isDeviceDetailTab(key: string): key is DeviceDetailTab {
  return (
    key === "info" || key === "broadcast-history" || key === "activity-history"
  );
}

function DeviceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Lấy dữ liệu thiết bị từ DeviceContext
  const { getDeviceById } = useDevices();

  // Tab đang được chọn
  const [activeTab, setActiveTab] = useState<DeviceDetailTab>("info");

  // Lấy thông tin thiết bị theo ID trên URL
  const device = id ? getDeviceById(id) : undefined;

  // Chuyển tab
  const handleTabChange = (key: string) => {
    if (isDeviceDetailTab(key)) {
      setActiveTab(key);
    }
  };

  // Chuyển đến trang chỉnh sửa thiết bị
  const handleEdit = () => {
    if (!device) return;

    navigate(`${ROUTES.DEVICES}/${device.id}/edit`);
  };

  // Kiểm tra thiết bị có tồn tại không
  if (!device) {
    return (
      <div className="device-detail-page">
        <div className="device-detail-page__panel">
          <h2>Không tìm thấy thiết bị</h2>

          <p>
            Thiết bị không tồn tại hoặc không có trong danh sách dữ liệu hiện
            tại.
          </p>

          <AppButton
            variant="primary"
            width="auto"
            onClick={() => navigate(ROUTES.DEVICES)}>
            Quay lại danh sách thiết bị
          </AppButton>
        </div>
      </div>
    );
  }

  // Hiển thị nội dung theo tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div className="device-detail-page__info-layout">
            {/* Thông tin thiết bị bên trái */}
            <DeviceInfo device={device} onEdit={handleEdit} />

            {/* Lịch phát thiết bị bên phải */}
            <DeviceSchedule deviceId={device.id} />
          </div>
        );

      case "broadcast-history":
        return <DeviceBroadcastHistory deviceId={device.id} />;

      case "activity-history":
        return <DeviceActivityHistory deviceId={device.id} />;

      default:
        return null;
    }
  };

  return (
    <div className="device-detail-page">
      {/* Tabs điều hướng */}
      <AppTabs
        items={tabItems}
        activeKey={activeTab}
        onChange={handleTabChange}
        ariaLabel="Chi tiết thiết bị"
        className="device-detail-page__tabs"
      />

      {/* Nội dung theo tab */}
      <div className="device-detail-page__content" data-device-id={device.id}>
        {renderTabContent()}
      </div>
    </div>
  );
}

export default DeviceDetailPage;
