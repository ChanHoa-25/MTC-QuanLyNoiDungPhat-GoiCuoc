import { useState } from "react";
import type { CSSProperties } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { ArrowRight } from "lucide-react";
import AppDatePicker from "../AppDatePicker";
import "./AppDateRangePicker.css";

export type DateRangeValue = [Dayjs | null, Dayjs | null];

export interface AppDateRangePickerProps {
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue;
  onChange?: (dates: DateRangeValue) => void;
  width?: number | string;
  disabled?: boolean;
  startPlaceholder?: string;
  endPlaceholder?: string;
  className?: string;
  style?: CSSProperties;
}

function AppDateRangePicker({
  value,
  defaultValue,
  onChange,
  width = 388,
  disabled = false,
  startPlaceholder = "Từ ngày",
  endPlaceholder = "Đến ngày",
  className = "",
  style,
}: AppDateRangePickerProps) {
  const [internalValue, setInternalValue] = useState<DateRangeValue>(
    defaultValue ?? [null, null],
  );

  const currentValue =
    value !== undefined ? (value ?? [null, null]) : internalValue;

  const [startDate, endDate] = currentValue;

  const updateRange = (dates: DateRangeValue) => {
    if (value === undefined) {
      setInternalValue(dates);
    }

    onChange?.(dates);
  };

  return (
    <div
      className={`app-date-range-picker ${className}`.trim()}
      style={{
        width,
        maxWidth: "100%",
        ...style,
      }}>
      <AppDatePicker
        width="100%"
        value={startDate}
        placeholder={startPlaceholder}
        disabled={disabled}
        disabledDate={(date) => !!endDate && date.isAfter(endDate, "day")}
        onChange={(date) => {
          const newStartDate = date && dayjs.isDayjs(date) ? date : null;

          updateRange([newStartDate, endDate]);
        }}
      />

      <ArrowRight
        size={18}
        className="app-date-range-arrow"
        aria-hidden="true"
      />

      <AppDatePicker
        width="100%"
        value={endDate}
        placeholder={endPlaceholder}
        disabled={disabled}
        disabledDate={(date) => !!startDate && date.isBefore(startDate, "day")}
        onChange={(date) => {
          const newEndDate = date && dayjs.isDayjs(date) ? date : null;

          updateRange([startDate, newEndDate]);
        }}
      />
    </div>
  );
}

export default AppDateRangePicker;
