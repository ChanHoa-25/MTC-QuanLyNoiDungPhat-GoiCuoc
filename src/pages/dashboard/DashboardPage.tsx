import { useEffect, useState } from "react";
import { Button, Card, Select } from "antd";
import {
  Cast,
  MapPin,
  Maximize2,
  Minimize2,
  MonitorSpeaker,
  RadioTower,
} from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon } from "leaflet";

import "leaflet/dist/leaflet.css";
import "./DashboardPage.css";

const usedStorage = 4;
const totalStorage = 5;

type DeviceStatus = "online" | "offline";
type FilterStatus = "all" | DeviceStatus;

interface Device {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: DeviceStatus;
}

const devices: Device[] = [
  {
    id: 1,
    name: "Thiết bị 1",
    address: "86/33 Âu Cơ, phường 9, quận Tân Bình, TP. HCM",
    lat: 10.769878,
    lng: 106.651172,
    status: "online",
  },
  {
    id: 2,
    name: "Thiết bị 2",
    address: "120 Lý Thái Tổ, phường 9, quận 10, TP. HCM",
    lat: 10.7679,
    lng: 106.6726,
    status: "online",
  },
  {
    id: 3,
    name: "Thiết bị 3",
    address: "45 Nguyễn Tri Phương, phường 8, quận 10, TP. HCM",
    lat: 10.7612,
    lng: 106.6689,
    status: "offline",
  },
  {
    id: 4,
    name: "Thiết bị 4",
    address: "210 Võ Văn Kiệt, phường 2, quận 5, TP. HCM",
    lat: 10.7503,
    lng: 106.6641,
    status: "online",
  },
  {
    id: 5,
    name: "Thiết bị 5",
    address: "33 Trần Hưng Đạo, phường 2, quận 5, TP. HCM",
    lat: 10.7545,
    lng: 106.6702,
    status: "online",
  },
  {
    id: 6,
    name: "Thiết bị 6",
    address: "78 Điện Biên Phủ, phường 6, quận 3, TP. HCM",
    lat: 10.7791,
    lng: 106.6819,
    status: "offline",
  },
  {
    id: 7,
    name: "Thiết bị 7",
    address: "12 Ngô Gia Tự, phường 2, quận 10, TP. HCM",
    lat: 10.7651,
    lng: 106.6638,
    status: "online",
  },
  {
    id: 8,
    name: "Thiết bị 8",
    address: "250 Lê Hồng Phong, phường 4, quận 5, TP. HCM",
    lat: 10.7586,
    lng: 106.6757,
    status: "online",
  },
  {
    id: 9,
    name: "Thiết bị 9",
    address: "9 Nguyễn Thị Minh Khai, phường 5, quận 3, TP. HCM",
    lat: 10.7845,
    lng: 106.6925,
    status: "offline",
  },
  {
    id: 10,
    name: "Thiết bị 10",
    address: "64 Ba Tháng Hai, phường 12, quận 10, TP. HCM",
    lat: 10.7718,
    lng: 106.6667,
    status: "online",
  },
  {
    id: 11,
    name: "Thiết bị 11",
    address: "301 Lý Thường Kiệt, phường 15, quận 11, TP. HCM",
    lat: 10.7735,
    lng: 106.6552,
    status: "online",
  },
  {
    id: 12,
    name: "Thiết bị 12",
    address: "18 Hoàng Văn Thụ, phường 4, quận Tân Bình, TP. HCM",
    lat: 10.7992,
    lng: 106.6568,
    status: "offline",
  },
  {
    id: 13,
    name: "Thiết bị 13",
    address: "55 Lạc Long Quân, phường 3, quận 11, TP. HCM",
    lat: 10.7646,
    lng: 106.6459,
    status: "online",
  },
  {
    id: 14,
    name: "Thiết bị 14",
    address: "7 Trần Phú, phường 4, quận 5, TP. HCM",
    lat: 10.7569,
    lng: 106.6798,
    status: "online",
  },
];

const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Đang hoạt động", value: "online" },
  { label: "Ngưng hoạt động", value: "offline" },
];

const statusText: Record<DeviceStatus, string> = {
  online: "Đang hoạt động",
  offline: "Ngưng hoạt động",
};

const statCards = [
  {
    key: "sites",
    variant: "pink",
    icon: MapPin,
    title: "Cơ sở",
    value: 60,
  },
  {
    key: "devices",
    variant: "green",
    icon: MonitorSpeaker,
    title: "Thiết bị phát bản tin điện tử",
    value: 43,
    total: 50,
  },
  {
    key: "broadcasts",
    variant: "cyan",
    icon: Cast,
    title: "Bản tin điện tử",
    value: 64,
  },
];

const PIN_COLOR: Record<DeviceStatus, string> = {
  online: "#4CC764",
  offline: "#E8484F",
};

const createPin = (status: DeviceStatus) =>
  divIcon({
    className: "device-pin",
    html: `
      <svg
        viewBox="0 0 24 32"
        width="28"
        height="36"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"
          fill="${PIN_COLOR[status]}"
          stroke="#fff"
          stroke-width="1.5"
        />
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

function ResizeOnToggle({ expanded }: { expanded: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [expanded, map]);

  return null;
}

function DashboardPage() {
  const [status, setStatus] = useState<FilterStatus>("all");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const percent =
    totalStorage > 0
      ? Math.min(100, Math.round((usedStorage / totalStorage) * 100))
      : 0;

  const visibleDevices = devices.filter(
    (device) => status === "all" || device.status === status,
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-stats">
        {statCards.map(({ key, variant, icon: Icon, title, value, total }) => (
          <Card
            key={key}
            className={`stat-card stat-card--${variant}`}
            variant="borderless"
            styles={{
              body: {
                padding: 0,
                height: "100%",
              },
            }}>
            <div className="stat-card__inner">
              <Icon
                className="stat-card__bg-icon"
                size={90}
                strokeWidth={1.25}
              />

              <span className="stat-card__badge">
                <Icon size={18} />
              </span>

              <div className="stat-card__body">
                <div className="stat-card__value">
                  {value}
                  {total !== undefined && (
                    <span className="stat-card__total">/{total}</span>
                  )}
                </div>
              </div>

              <div className="stat-card__title">{title}</div>
            </div>
          </Card>
        ))}

        <Card
          className="stat-card stat-card--blue storage-card"
          variant="borderless"
          styles={{
            body: {
              padding: 0,
              height: "100%",
            },
          }}>
          <div className="stat-card__inner">
            <RadioTower
              className="stat-card__bg-icon"
              size={90}
              strokeWidth={1.25}
            />

            <div className="stat-card__body storage-card__body">
              <div className="storage-card__text">
                Đã sử dụng {usedStorage}GB / {totalStorage}GB
              </div>

              <div
                className="storage-card__bar"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}>
                <div
                  className="storage-card__fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div className="stat-card__title">Dung lượng</div>
          </div>
        </Card>
      </div>

      <div className="dashboard-filter">
        <span className="dashboard-filter__label">Trạng thái</span>

        <Select
          value={status}
          onChange={(value: FilterStatus) => setStatus(value)}
          className="dashboard-filter__select"
          options={statusOptions}
        />
      </div>

      <section
        className={`dashboard-map${
          expanded ? " dashboard-map--expanded" : ""
        }`}>
        <MapContainer
          center={[10.77, 106.66]}
          zoom={14}
          className="dashboard-map__leaflet">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ResizeOnToggle expanded={expanded} />

          {visibleDevices.map((device) => (
            <Marker
              key={device.id}
              position={[device.lat, device.lng]}
              icon={pinIcons[device.status]}>
              <Popup className="device-popup" minWidth={240}>
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
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <Button
          className="dashboard-map__expand"
          icon={expanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? "Thu nhỏ bản đồ" : "Phóng to bản đồ"}
        />
      </section>
    </div>
  );
}

export default DashboardPage;
