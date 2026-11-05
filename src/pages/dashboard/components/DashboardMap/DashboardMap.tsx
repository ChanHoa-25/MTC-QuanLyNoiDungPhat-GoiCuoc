import { useEffect, useMemo, useState } from "react";

import { Button } from "antd";
import { Maximize2, Minimize2 } from "lucide-react";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { divIcon } from "leaflet";

import DashboardDevicePopup from "../DashboardDevicePopup";

import type {
  DashboardDevice,
  DashboardDeviceStatus,
} from "../../types/dashboard.types";

import "./DashboardMap.css";

interface DashboardMapProps {
  devices: DashboardDevice[];
}

const PIN_COLOR: Record<DashboardDeviceStatus, string> = {
  online: "#4CC764",
  offline: "#E8484F",
};

function createPin(status: DashboardDeviceStatus) {
  return divIcon({
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

        <circle
          cx="12"
          cy="12"
          r="5"
          fill="#fff"
        />
      </svg>
    `,

    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34],
  });
}

const pinIcons = {
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

function DashboardMap({ devices }: DashboardMapProps) {
  const [expanded, setExpanded] = useState(false);

  const validDevices = useMemo(
    () =>
      devices.filter(
        (device) =>
          Number.isFinite(device.lat) &&
          Number.isFinite(device.lng) &&
          device.lat >= -90 &&
          device.lat <= 90 &&
          device.lng >= -180 &&
          device.lng <= 180,
      ),
    [devices],
  );

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

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  return (
    <section
      className={`dashboard-map${expanded ? " dashboard-map--expanded" : ""}`}
      aria-label="Bản đồ vị trí thiết bị">
      <MapContainer
        center={[10.77, 106.66]}
        zoom={14}
        className="dashboard-map__leaflet">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ResizeOnToggle expanded={expanded} />

        {validDevices.map((device) => (
          <Marker
            key={device.id}
            position={[device.lat, device.lng]}
            icon={pinIcons[device.status]}>
            <Popup className="device-popup" minWidth={240}>
              <DashboardDevicePopup device={device} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <Button
        className="dashboard-map__expand"
        icon={expanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        onClick={() => setExpanded((value) => !value)}
        aria-label={expanded ? "Thu nhỏ bản đồ" : "Phóng to bản đồ"}
        title={expanded ? "Thu nhỏ bản đồ" : "Phóng to bản đồ"}
      />
    </section>
  );
}

export default DashboardMap;
