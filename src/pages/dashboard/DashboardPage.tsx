import { useMemo, useState } from "react";
import DashboardStatCard from "./components/DashboardStatCard";
import DashboardStorageCard from "./components/DashboardStorageCard";
import DashboardMap from "./components/DashboardMap";
import AppSelect from "../../components/common/AppSelect";

import {
  dashboardStats,
  dashboardStorage,
  dashboardDevices,
} from "./data/dashboard.mock";

import type { DashboardFilterStatus } from "./types/dashboard.types";

import "leaflet/dist/leaflet.css";
import "./DashboardPage.css";

const statusOptions = [
  {
    label: "Tất cả",
    value: "all",
  },
  {
    label: "Đang hoạt động",
    value: "online",
  },
  {
    label: "Ngưng hoạt động",
    value: "offline",
  },
];

function DashboardPage() {
  const [status, setStatus] = useState<DashboardFilterStatus>("all");

  const visibleDevices = useMemo(
    () =>
      dashboardDevices.filter(
        (device) => status === "all" || device.status === status,
      ),
    [status],
  );

  return (
    <div className="dashboard-page">
      {/* Thống kê tổng quan */}
      <div className="dashboard-stats">
        {dashboardStats.map(({ key, ...props }) => (
          <DashboardStatCard key={key} {...props} />
        ))}

        <DashboardStorageCard
          used={dashboardStorage.used}
          total={dashboardStorage.total}
        />
      </div>

      {/* Lọc trạng thái thiết bị */}
      <div className="dashboard-filter">
        <label htmlFor="dashboard-status" className="dashboard-filter__label">
          Trạng thái
        </label>

        <AppSelect
          id="dashboard-status"
          value={status}
          onChange={(value) => setStatus(value as DashboardFilterStatus)}
          options={statusOptions}
          className="dashboard-filter__select"
          width={210}
        />
      </div>

      {/* Bản đồ thiết bị */}
      <DashboardMap devices={visibleDevices} />
    </div>
  );
}

export default DashboardPage;
