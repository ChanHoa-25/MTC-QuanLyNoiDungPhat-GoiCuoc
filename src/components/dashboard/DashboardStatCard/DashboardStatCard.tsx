import { Card } from "antd";

import type { DashboardStatCardProps } from "../dashboard.types";

import "./DashboardStatCard.css";

function DashboardStatCard({
  variant,
  icon: Icon,
  title,
  value,
  total,
  unit,
  className = "",
}: DashboardStatCardProps) {
  return (
    <Card
      className={`stat-card stat-card--${variant} ${className}`}
      variant="borderless"
      styles={{
        body: {
          padding: 0,
          height: "100%",
        },
      }}>
      <div className="stat-card__inner">
        {/* Icon: chỉ hiển thị khi được truyền */}
        {Icon && (
          <>
            <Icon className="stat-card__bg-icon" size={90} strokeWidth={1.25} />

            <span className="stat-card__badge">
              <Icon size={18} />
            </span>
          </>
        )}

        {/* Giá trị thống kê */}
        <div className="stat-card__body">
          <div className="stat-card__value">
            {value}

            {total !== undefined && (
              <span className="stat-card__total">/{total}</span>
            )}

            {unit && <span className="stat-card__unit">{unit}</span>}
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="stat-card__title">{title}</div>
      </div>
    </Card>
  );
}

export default DashboardStatCard;
