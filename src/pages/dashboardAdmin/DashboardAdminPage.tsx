import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./DashboardAdminPage.css";

// Giả sử dự án có sẵn AppSelect, nếu không bạn có thể dùng Select của antd
import AppSelect from "../../components/common/AppSelect";

import type {
  DeviceItem,
  DeviceStatus,
  FilterStatus,
} from "./types/dashboardAdmin.types";
import { MOCK_DEVICES, ORG_OPTIONS, STATUS_OPTIONS, STATUS_TEXT } from "./data/dashboardAdmin.mock";

const PIN_COLOR: Record<DeviceStatus, string> = {
  online: "#4CC764",
  offline: "#E8484F",
};

// Khởi tạo Icon pin map
const createPin = (status: DeviceStatus) =>
  divIcon({
    className: "device-pin",
    html: `
      <svg viewBox="0 0 24 32" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${PIN_COLOR[status]}" stroke="#fff" stroke-width="1.5" />
        <circle cx="12" cy="12" r="5" fill="#fff" />
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34],
  });

const pinIcons: Record<DeviceStatus, ReturnType<typeof createPin>> = {
  online: createPin("online"),
  offline: createPin("offline"),
};

// Fix lỗi map không full width khi render
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(timer);
  }, [map]);
  return null;
}

const DashboardAdminPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const visibleDevices = useMemo(() => {
    return MOCK_DEVICES.filter((device: DeviceItem) => {
      const matchStatus = statusFilter === "all" || device.status === statusFilter;
      const matchOrg = orgFilter === "all" || device.organization === orgFilter;
      return matchStatus && matchOrg;
    });
  }, [statusFilter, orgFilter]);

  // Cấu hình 5 thẻ thống kê giống Figma
  const statCards = [
    { key: "orgs", value: 60, unit: "", label: "Tổ chức", colorClass: "pink" },
    { key: "expired", value: 43, unit: "", label: "Tổ chức hết hạn", colorClass: "green" },
    { key: "active", value: 64, unit: "", label: "Tổ chức còn hạn", colorClass: "light-pink" },
    { key: "used_storage", value: 40000, unit: "GB", label: "Dung lượng tổ chức đã sử dụng", colorClass: "blue" },
    { key: "total_storage", value: 40000, unit: "GB", label: "Dung lượng tổ chức đã đăng ký", colorClass: "orange" },
  ];

  return (
    <div className="dash-admin-wrapper">
      
      {/* KHU VỰC 5 THẺ THỐNG KÊ */}
      <div className="dash-admin-stats">
        {statCards.map((card) => (
          <div key={card.key} className={`dash-admin-card ${card.colorClass}`}>
            <div className="dash-admin-value">
              {card.value}
              {card.unit && <span className="dash-admin-unit">{card.unit}</span>}
            </div>
            <div className="dash-admin-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* BỘ LỌC */}
      <div className="dash-admin-filters">
        <div style={{ width: 200 }}>
          <label className="dash-admin-filter-label">Tổ chức</label>
          <AppSelect 
            width="100%" 
            value={orgFilter} 
            onChange={(val) => setOrgFilter(val as string)} 
            options={ORG_OPTIONS} 
          />
        </div>
        <div style={{ width: 200 }}>
          <label className="dash-admin-filter-label">Trạng thái hoạt động</label>
          <AppSelect 
            width="100%" 
            value={statusFilter} 
            onChange={(val) => setStatusFilter(val as FilterStatus)} 
            options={STATUS_OPTIONS} 
          />
        </div>
      </div>

      {/* KHU VỰC BẢN ĐỒ VÀ POPUP (Dark Theme) */}
      <section className="dash-admin-map-container">
        <MapContainer center={[10.77, 106.66]} zoom={14} className="dash-admin-map-leaflet">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer />

          {/* Duyệt qua mảng để render Marker */}
          {visibleDevices.map((device) => (
            <Marker key={device.id} position={[device.lat, device.lng]} icon={pinIcons[device.status]}>
              <Popup className="dark-map-popup" minWidth={260}>
                <div className="dark-popup-title">Thông tin thiết bị</div>
                
                <div className="dark-popup-row">
                  <span className="dark-popup-label">Tên thiết bị:</span>
                  <span className="dark-popup-value">{device.name}</span>
                </div>
                <div className="dark-popup-row">
                  <span className="dark-popup-label">Tổ chức:</span>
                  <span className="dark-popup-value">{device.organization}</span>
                </div>
                <div className="dark-popup-row">
                  <span className="dark-popup-label">Địa chỉ:</span>
                  <span className="dark-popup-value" style={{ maxWidth: '140px', whiteSpace: 'normal', textAlign: 'right' }}>
                    {device.address}
                  </span>
                </div>
                <div className="dark-popup-row">
                  <span className="dark-popup-label">Tọa độ:</span>
                  <span className="dark-popup-value">
                    {device.lat.toFixed(6)}, {device.lng.toFixed(6)}
                  </span>
                </div>
                <div className="dark-popup-row">
                  <span className="dark-popup-label">Trạng thái:</span>
                  <div className={`dark-popup-status ${device.status}`}>
                    <span className={`dark-popup-dot ${device.status}`} />
                    {STATUS_TEXT[device.status]}
                  </div>
                </div>

              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

    </div>
  );
};

export default DashboardAdminPage;