import { useState } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { Triangle } from "lucide-react";
import "./AppSelect.css";

export interface AppSelectProps extends SelectProps {
  width?: number | string;
}

function AppSelect({
  width = 210,
  placeholder = "Chọn",
  allowClear = false,
  className = "",
  style,
  open,
  onOpenChange,
  suffixIcon,
  classNames,
  ...props
}: AppSelectProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open ?? internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const mergedClassNames: SelectProps["classNames"] = (info) => {
    const customClassNames =
      typeof classNames === "function" ? classNames(info) : classNames;

    return {
      ...customClassNames,
      popup: {
        ...customClassNames?.popup,
        root: ["app-select-dropdown", customClassNames?.popup?.root]
          .filter(Boolean)
          .join(" "),
      },
    };
  };

  return (
    <Select
      {...props}
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={`app-select ${className}`.trim()}
      classNames={mergedClassNames}
      style={{ width, ...style }}
      placeholder={placeholder}
      allowClear={allowClear}
      suffixIcon={
        suffixIcon ?? (
          <Triangle
            size={12}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={2}
            className={`app-select-arrow-icon ${isOpen ? "open" : ""}`}
          />
        )
      }
    />
  );
}

export default AppSelect;
