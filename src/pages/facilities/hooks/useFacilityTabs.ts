import { useSearchParams } from "react-router-dom";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");

  const currentTab = facilityTabs.find((tab) => tab.key === tabParam);

  const activeTab: FacilityTabKey = currentTab?.key ?? "info";

  const changeTab = (key: string): boolean => {
    const nextTab = facilityTabs.find((tab) => tab.key === key);

    if (!nextTab) return false;

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      if (nextTab.key === "info") {
        next.delete("tab");
      } else {
        next.set("tab", nextTab.key);
      }

      return next;
    });

    return true;
  };

  const resetTab = () => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("tab");
      return next;
    });
  };

  return {
    activeTab,
    changeTab,
    resetTab,
  };
}
