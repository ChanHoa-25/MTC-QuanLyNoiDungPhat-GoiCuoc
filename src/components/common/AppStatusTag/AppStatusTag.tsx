import type { HTMLAttributes } from "react";
import { Tag } from "antd";
import "./AppStatusTag.css";

export type AppStatusVariant =
  | "green"
  | "red"
  | "orange"
  | "yellow"
  | "darkRed"
  | "gray"
  | "blue"
  | "outlineOrange";

export type AppStatusLabelVariant = "green" | "blue" | "orange" | "yellow";

type BaseProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  label: string;
};

export type AppStatusTagProps =
  | (BaseProps & {
      type?: "status";
      variant: AppStatusVariant;
    })
  | (BaseProps & {
      type: "label";
      variant: AppStatusLabelVariant;
    });

function AppStatusTag({
  type = "status",
  variant,
  label,
  className = "",
  title,
  ...props
}: AppStatusTagProps) {
  const classes = [
    "app-status-tag",
    `app-status-tag--${type}`,
    `app-status-tag--${type}-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag {...props} className={classes} title={title ?? label}>
      <span className="app-status-tag__content">
        {type === "status" && (
          <span className="app-status-tag__dot" aria-hidden="true" />
        )}

        <span className="app-status-tag__text">{label}</span>
      </span>
    </Tag>
  );
}

export default AppStatusTag;
