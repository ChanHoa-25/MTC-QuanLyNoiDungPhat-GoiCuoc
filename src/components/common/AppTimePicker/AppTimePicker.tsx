import { TimePicker } from "antd";
import type { TimePickerProps } from "antd";
import { Clock3 } from "lucide-react";
import "./AppTimePicker.css";

export interface AppTimePickerProps extends TimePickerProps {
  width?: number | string;
}

function AppTimePicker({
  width = 190,
  placeholder = "Chọn giờ",
  format = "HH:mm:ss",
  className = "",
  style,
  suffixIcon,
  ...props
}: AppTimePickerProps) {
  return (
    <TimePicker
      {...props}
      className={`app-time-picker ${className}`.trim()}
      placeholder={placeholder}
      format={format}
      suffixIcon={suffixIcon ?? <Clock3 size={20} color="#F26D21" />}
      style={{
        width,
        maxWidth: "100%",
        ...style,
      }}
    />
  );
}

export default AppTimePicker;
