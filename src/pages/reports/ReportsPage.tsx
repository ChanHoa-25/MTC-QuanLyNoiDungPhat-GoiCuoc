import { useState } from "react";

import AppTabs from "../../components/common/AppTabs";

import FacilityReport from "./components/FacilityReport/FacilityReport";
import SourceReport from "./components/SourceReport/SourceReport";

import type { ReportTabKey } from "./types/report.types";

import "./ReportsPage.css";
import DeviceReport from "./components/DeviceReport/DeviceReport";
import BroadcastReport from "./components/BroadcastReport/BroadcastReport";

const reportTabs = [
  { key: "facilities", label: "Cơ sở" },
  { key: "sources", label: "Nguồn tin" },
  { key: "devices", label: "Thiết bị" },
  { key: "broadcasts", label: "Bản tin" },
];

function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTabKey>("facilities");

  const renderContent = () => {
    switch (activeTab) {
      case "facilities":
        return <FacilityReport />;

      case "sources":
        return <SourceReport />;

      case "devices":
        return <DeviceReport />;

      case "broadcasts":
        return <BroadcastReport />;
      default:
        return null;
    }
  };

  return (
    <div className="reports-page">
      <AppTabs
        items={reportTabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as ReportTabKey)}
        ariaLabel="Danh mục báo cáo"
      />

      <div className="reports-page__content">{renderContent()}</div>
    </div>
  );
}

export default ReportsPage;
