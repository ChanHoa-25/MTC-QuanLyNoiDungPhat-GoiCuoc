import { Button } from "antd";
import type { ButtonProps } from "antd";
import "./AppButton.css";

export interface AppButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "outline";
  width?: number | string;
}

function AppButton({
  variant = "primary",
  width = 158,
  className = "",
  style,
  children,
  htmlType = "button",
  ...props
}: AppButtonProps) {
  return (
    <Button
      {...props}
      htmlType={htmlType}
      className={["app-button", `app-button--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      style={{
        width,
        ...style,
      }}>
      {children}
    </Button>
  );
}

export default AppButton;
