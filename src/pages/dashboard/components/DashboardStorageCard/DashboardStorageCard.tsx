import { Card } from "antd";
import { RadioTower } from "lucide-react";

import type { DashboardStorage } from "../../types/dashboard.types";
import "./DashboardStorageCard.css";

function DashboardStorageCard({ used, total }: DashboardStorage) {
  const percent =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((used / total) * 100)))
      : 0;

  return (
    <Card
      className="stat-card stat-card--blue storage-card"
      variant="borderless"
      styles={{
        body: {
          padding: 0,
          height: "100%",
        },
      }}>
      <div className="stat-card__inner">
        <RadioTower
          className="stat-card__bg-icon"
          size={90}
          strokeWidth={1.25}
        />

        <div className="stat-card__body storage-card__body">
          <div className="storage-card__text">
            Đã sử dụng {used}GB / {total}GB
          </div>

          <div
            className="storage-card__bar"
            role="progressbar"
            aria-label="Dung lượng đã sử dụng"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}>
            <div
              className="storage-card__fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="stat-card__title">Dung lượng</div>
      </div>
    </Card>
  );
}

export default DashboardStorageCard;
