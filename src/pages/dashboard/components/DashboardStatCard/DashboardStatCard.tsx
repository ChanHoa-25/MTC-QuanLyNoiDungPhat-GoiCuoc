import { Card } from "antd";

import type { DashboardStat } from "../../types/dashboard.types";
import "./DashboardStatCard.css";

type DashboardStatCardProps = DashboardStat;

function DashboardStatCard({
  variant,
  icon: Icon,
  title,
  value,
  total,
}: DashboardStatCardProps) {
  return (
    <Card
      className={`stat-card stat-card--${variant}`}
      variant="borderless"
      styles={{
        body: {
          padding: 0,
          height: "100%",
        },
      }}>
      <div className="stat-card__inner">
        <Icon className="stat-card__bg-icon" size={90} strokeWidth={1.25} />

        <span className="stat-card__badge">
          <Icon size={18} />
        </span>

        <div className="stat-card__body">
          <div className="stat-card__value">
            {value}

            {total !== undefined && (
              <span className="stat-card__total">/{total}</span>
            )}
          </div>
        </div>

        <div className="stat-card__title">{title}</div>
      </div>
    </Card>
  );
}

export default DashboardStatCard;
