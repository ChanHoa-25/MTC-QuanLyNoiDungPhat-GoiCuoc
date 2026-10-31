import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";
import { CalendarDays } from "lucide-react";
import "./AppDatePicker.css";

export interface AppDatePickerProps extends Omit<DatePickerProps, "picker"> {
  width?: number | string;
}

function AppDatePicker({
  width = 180,
  placeholder = "Chọn ngày",
  format = "DD/MM/YYYY",
  className = "",
  style,
  suffixIcon,
  ...props
}: AppDatePickerProps) {
  return (
    <DatePicker
      {...props}
      className={`app-date-picker ${className}`.trim()}
      placeholder={placeholder}
      format={format}
      suffixIcon={suffixIcon ?? <CalendarDays size={20} />}
      style={{
        width,
        maxWidth: "100%",
        ...style,
      }}
    />
  );
}

export default AppDatePicker;
