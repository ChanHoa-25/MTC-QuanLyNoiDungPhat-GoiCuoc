import { useMemo, useState } from "react";
import { MapPin, MonitorPlay, AudioLines } from "lucide-react";

import DashboardStatCard from "../../../components/dashboard/DashboardStatCard/DashboardStatCard";
import DashboardMap from "../../../components/dashboard/DashboardMap/DashboardMap";
import AppSelect from "../../../components/common/AppSelect";

import type { DashboardStatCardProps } from "../../../components/dashboard/dashboard.types";
import type { DeviceItem, FilterStatus } from "./types/dashboardAdmin.types";

import {
  MOCK_DEVICES,
  ORG_OPTIONS,
  STATUS_OPTIONS,
} from "./data/dashboardAdmin.mock";

import "./DashboardPage.css";

const statCards: (DashboardStatCardProps & { key: string })[] = [
  {
    key: "orgs",
    variant: "pink",
    icon: MapPin,
    title: "Tổ chức",
    value: 60,
  },
  {
    key: "expired",
    variant: "green",
    icon: MonitorPlay,
    title: "Tổ chức hết hạn",
    value: 43,
  },
  {
    key: "active",
    variant: "light-pink",
    icon: AudioLines,
    title: "Tổ chức còn hạn",
    value: 64,
  },
  {
    key: "used_storage",
    variant: "blue",
    title: "Dung lượng tổ chức đã sử dụng",
    value: 40000,
    unit: "GB",
  },
  {
    key: "total_storage",
    variant: "orange",
    title: "Dung lượng tổ chức đã đăng ký",
    value: 40000,
    unit: "GB",
  },
];

function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const visibleDevices = useMemo(() => {
    return MOCK_DEVICES.filter((device: DeviceItem) => {
      const matchStatus =
        statusFilter === "all" || device.status === statusFilter;

      const matchOrg = orgFilter === "all" || device.organization === orgFilter;

      return matchStatus && matchOrg;
    });
  }, [statusFilter, orgFilter]);

  return (
    <div className="dash-admin-wrapper">
      <div className="dash-admin-stats">
        {statCards.map(({ key, ...props }) => (
          <DashboardStatCard key={key} {...props} />
        ))}
      </div>

      <div className="dash-admin-filters">
        <div className="dash-admin-filter-field">
          <label htmlFor="dash-admin-org" className="dash-admin-filter-label">
            Tổ chức
          </label>

          <AppSelect
            id="dash-admin-org"
            width={210}
            value={orgFilter}
            onChange={(value) => setOrgFilter(value as string)}
            options={ORG_OPTIONS}
          />
        </div>

        <div className="dash-admin-filter-field">
          <label
            htmlFor="dash-admin-status"
            className="dash-admin-filter-label">
            Trạng thái hoạt động
          </label>

          <AppSelect
            id="dash-admin-status"
            width={210}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as FilterStatus)}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="dash-admin-map-container">
        <DashboardMap devices={visibleDevices} />
      </div>
    </div>
  );
}

export default DashboardPage;
