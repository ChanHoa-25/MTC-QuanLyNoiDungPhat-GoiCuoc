import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";
import type { Dayjs } from "dayjs";
import { CalendarDays } from "lucide-react";
import "./AppDatePicker.css";

export interface AppDatePickerProps extends Omit<
  DatePickerProps,
  "picker" | "multiple" | "value" | "defaultValue" | "onChange" | "onOk"
> {
  width?: number | string;
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (date: Dayjs | null, dateString: string) => void;
  onOk?: (date: Dayjs) => void;
}

function AppDatePicker({
  width = 180,
  placeholder = "Chọn ngày",
  format = "DD/MM/YYYY",
  className = "",
  style,
  suffixIcon,
  value,
  defaultValue,
  onChange,
  onOk,
  ...props
}: AppDatePickerProps) {
  return (
    <DatePicker
      {...props}
      multiple={false}
      value={value}
      defaultValue={defaultValue}
      className={`app-date-picker ${className}`.trim()}
      placeholder={placeholder}
      format={format}
      suffixIcon={suffixIcon ?? <CalendarDays size={20} />}
      onChange={(date, dateString) => {
        onChange?.(date, dateString ?? "");
      }}
      onOk={(date) => {
        if (date) {
          onOk?.(date);
        }
      }}
      style={{
        width,
        maxWidth: "100%",
        ...style,
      }}
    />
  );
}

export default AppDatePicker;
