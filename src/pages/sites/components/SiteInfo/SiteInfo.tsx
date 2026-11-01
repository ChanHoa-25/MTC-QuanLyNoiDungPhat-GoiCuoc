import type { Site } from "../../types/site.types";
import AppStatusTag from "../../../../components/common/AppStatusTag";

import "./SiteInfo.css";

interface SiteInfoProps {
  site: Site;
}

function SiteInfo({ site }: SiteInfoProps) {
  const isActive = site.status === "active";

  return (
    <section className="site-info">
      {/* Tiêu đề thông tin cơ sở */}
      <h2 className="site-info-title">Thông tin cơ sở - {site.name}</h2>

      {/* Danh sách thông tin */}
      <div className="site-info-fields">
        {/* Mã cơ sở */}
        <div className="site-info-field">
          <span className="site-info-label">Mã cơ sở:</span>

          <span className="site-info-value">{site.code}</span>
        </div>

        {/* Tên cơ sở */}
        <div className="site-info-field">
          <span className="site-info-label">Tên cơ sở:</span>

          <span className="site-info-value">{site.name}</span>
        </div>

        {/* Trực thuộc */}
        <div className="site-info-field">
          <span className="site-info-label">Trực thuộc:</span>

          <span className="site-info-value">{site.parentName ?? "—"}</span>
        </div>

        {/* Trạng thái hoạt động */}
        <div className="site-info-field">
          <span className="site-info-label">Trạng thái hoạt động:</span>

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

export default SiteInfo;
