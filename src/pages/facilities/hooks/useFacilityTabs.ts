import { useState } from "react";

import type { FacilityTab, FacilityTabKey } from "../types/facility.types";

export const facilityTabs: FacilityTab[] = [
  { key: "info", label: "Thông tin cơ sở" },
  { key: "users", label: "Quản lý người dùng" },
  { key: "devices", label: "Thiết bị" },
  { key: "media", label: "Media" },
  { key: "templates", label: "Bản mẫu" },
  { key: "playlists", label: "Danh sách phát" },
];

export function useFacilityTabs() {
  const [activeTab, setActiveTab] = useState<FacilityTabKey>("info");

  const changeTab = (key: string) => {
    const nextTab = facilityTabs.find((tab) => tab.key === key);

    if (!nextTab) return false;

    setActiveTab(nextTab.key);
    return true;
  };

  const resetTab = () => {
    setActiveTab("info");
  };

  return {
    activeTab,
    changeTab,
    resetTab,
  };
}
