import FacilityBroadcasts from "../FacilityBroadcasts/FacilityBroadcasts";

import "./ChildFacilityBroadcasts.css";

function ChildFacilityBroadcasts() {
  return (
    <div className="child-facility-broadcasts">
      <FacilityBroadcasts isChildFacility showActions={false} />
    </div>
  );
}

export default ChildFacilityBroadcasts;
