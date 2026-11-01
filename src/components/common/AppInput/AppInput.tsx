import { Input } from "antd";
import type { InputProps } from "antd";
import "./AppInput.css";

export interface AppInputProps extends InputProps {
  width?: number | string;
  height?: number | string;
}

function AppInput({
  width = 639,
  height,
  type = "text",
  placeholder = "Tìm kiếm",
  className = "",
  style,
  ...props
}: AppInputProps) {
  const inputProps = {
    ...props,
    placeholder,
    className: `app-input ${className}`.trim(),
    style: {
      width,
      maxWidth: "100%",
      ...(height !== undefined ? { height } : {}),
      ...style,
    },
  };

  if (type === "password") {
    return <Input.Password {...inputProps} />;
  }

  return <Input {...inputProps} type={type} />;
}

export default AppInput;
