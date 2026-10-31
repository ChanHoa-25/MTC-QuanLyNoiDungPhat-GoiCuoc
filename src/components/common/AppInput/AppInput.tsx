import { Input } from "antd";
import type { InputProps } from "antd";
import "./AppInput.css";

export interface AppInputProps extends InputProps {
  width?: number | string;
}

function AppInput({
  width = 639,
  placeholder = "Tìm kiếm",
  className = "",
  style,
  ...props
}: AppInputProps) {
  return (
    <Input
      {...props}
      className={`app-input ${className}`.trim()}
      style={{
        width,
        maxWidth: "100%",
        ...style,
      }}
      placeholder={placeholder}
    />
  );
}

export default AppInput;
