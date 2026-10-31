import { useState } from "react";
import { Input } from "antd";
import type { InputProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./AppSearch.css";

export interface AppSearchProps extends Omit<InputProps, "onChange" | "width"> {
  width?: number | string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}

function AppSearch({
  value,
  defaultValue,
  placeholder = "Tìm kiếm",
  width = 301,
  disabled = false,
  className = "",
  style,
  onChange,
  onSearch,
  suffix,
  onPressEnter,
  ...props
}: AppSearchProps) {
  const [internalValue, setInternalValue] = useState(
    String(defaultValue ?? ""),
  );

  const isControlled = value !== undefined;

  const currentValue = isControlled ? String(value ?? "") : internalValue;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const handleSearch = () => {
    if (disabled) return;

    onSearch?.(currentValue);
  };

  return (
    <Input
      {...props}
      value={currentValue}
      placeholder={placeholder}
      disabled={disabled}
      className={`app-search ${className}`.trim()}
      style={{ width, ...style }}
      suffix={
        suffix ?? (
          <button
            type="button"
            className="app-search__button"
            onClick={handleSearch}
            disabled={disabled}
            aria-label="Tìm kiếm">
            <SearchOutlined className="app-search__icon" />
          </button>
        )
      }
      onChange={handleChange}
      onPressEnter={(event) => {
        onPressEnter?.(event);
        if (!event.defaultPrevented) {
          handleSearch();
        }
      }}
    />
  );
}

export default AppSearch;
