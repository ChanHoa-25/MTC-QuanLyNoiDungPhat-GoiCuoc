import { useSearchParams } from "react-router-dom";

import AppTabs from "../../components/common/AppTabs";
import FacilityBroadcasts from "./FacilityBroadcasts/FacilityBroadcasts";
import ChildFacilityBroadcasts from "./ChildFacilityBroadcasts/ChildFacilityBroadcasts";

import "./BroadcastPage.css";

type BroadcastTab = "facility" | "child-facility";

function BroadcastPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: BroadcastTab =
    searchParams.get("tab") === "child-facility"
      ? "child-facility"
      : "facility";

  const handleTabChange = (key: string) => {
    if (key !== "facility" && key !== "child-facility") {
      return;
    }

    setSearchParams(key === "facility" ? {} : { tab: "child-facility" }, {
      replace: true,
    });
  };

  return (
    <div className="broadcast-page">
      <AppTabs
        items={[
          {
            key: "facility",
            label: "Bản tin của cơ sở",
          },
          {
            key: "child-facility",
            label: "Bản tin cơ sở con",
          },
        ]}
        activeKey={activeTab}
        onChange={handleTabChange}
        ariaLabel="Quản lý bản tin"
        className="broadcast-page__tabs"
      />

      {activeTab === "facility" ? (
        <FacilityBroadcasts />
      ) : (
        <ChildFacilityBroadcasts />
      )}
    </div>
  );
}

export default BroadcastPage;
