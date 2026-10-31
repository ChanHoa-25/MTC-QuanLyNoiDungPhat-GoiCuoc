import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Tooltip } from "antd";
import "./AppIconButton.css";

export interface AppIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  icon: ReactNode;
  tooltip?: string;
  size?: number;
  iconSize?: number;
  danger?: boolean;
}

function AppIconButton({
  icon,
  tooltip,
  size = 36,
  iconSize = 24,
  danger = false,
  className = "",
  style,
  type = "button",
  ...props
}: AppIconButtonProps) {
  const button = (
    <button
      {...props}
      type={type}
      className={[
        "app-icon-button",
        danger ? "app-icon-button--danger" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      aria-label={props["aria-label"] ?? tooltip ?? "Thao tác"}>
      <span
        className="app-icon-button__icon"
        style={{
          width: iconSize,
          height: iconSize,
        }}
        aria-hidden="true">
        {icon}
      </span>
    </button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip title={tooltip}>
      <span className="app-icon-button__wrapper">{button}</span>
    </Tooltip>
  );
}

export default AppIconButton;
