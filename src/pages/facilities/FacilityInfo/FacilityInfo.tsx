import type { Facility } from "../types/facility.types";
import { findFacilityById } from "../utils/facility.utils";
import { useFacilityContext } from "../../../contexts/FacilityContext";

import AppStatusTag from "../../../components/common/AppStatusTag";

import "./FacilityInfo.css";

interface FacilityInfoProps {
  facility: Facility;
  parentName?: string;
}

function FacilityInfo({ facility, parentName = "—" }: FacilityInfoProps) {
  const { facilities } = useFacilityContext();
  const isActive = facility.isActive;

  const resolvedParentName =
    parentName !== "—" ? parentName :
    facility.parentId
      ? findFacilityById(facilities, facility.parentId)?.facilityName ?? "—"
      : "—";

  return (
    <section className="facility-info">
      <h2 className="facility-info-title">
        Thông tin cơ sở - {facility.facilityName}
      </h2>

      <div className="facility-info-fields">
        <div className="facility-info-field">
          <span className="facility-info-label">Mã cơ sở:</span>

          <span className="facility-info-value">{facility.facilityCode}</span>
        </div>

        <div className="facility-info-field">
          <span className="facility-info-label">Tên cơ sở:</span>

          <span className="facility-info-value">{facility.facilityName}</span>
        </div>

        <div className="facility-info-field">
          <span className="facility-info-label">Trực thuộc:</span>

          <span className="facility-info-value">{resolvedParentName}</span>
        </div>

        <div className="facility-info-field">
          <span className="facility-info-label">Trạng thái hoạt động:</span>

          <AppStatusTag
            type="status"
            variant={isActive ? "green" : "red"}
            label={isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
          />
        </div>
      </div>
    </section>
  );
}

export default FacilityInfo;
