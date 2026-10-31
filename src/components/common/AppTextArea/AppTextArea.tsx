import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";
import "./AppTextArea.css";

export interface AppTextAreaProps extends TextAreaProps {
  width?: number | string;
  height?: number | string;
}

function AppTextArea({
  width = 345,
  height = 96,
  placeholder = "Mô tả",
  className = "",
  style,
  ...props
}: AppTextAreaProps) {
  return (
    <Input.TextArea
      {...props}
      className={`app-textarea ${className}`.trim()}
      placeholder={placeholder}
      style={{
        width,
        height,
        maxWidth: "100%",
        ...style,
      }}
    />
  );
}

export default AppTextArea;
