import type { ReactNode } from "react";

import "./AppTabs.css";

export interface AppTabItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface AppTabsProps {
  items: AppTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  ariaLabel?: string;
}

function AppTabs({
  items,
  activeKey,
  onChange,
  className = "",
  ariaLabel = "Danh mục nội dung",
}: AppTabsProps) {
  const classes = ["app-tabs", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.key}`}
            tabIndex={isActive && !item.disabled ? 0 : -1}
            disabled={item.disabled}
            className={[
              "app-tabs__item",
              isActive ? "app-tabs__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(item.key)}>
            {item.icon && (
              <span className="app-tabs__icon" aria-hidden="true">
                {item.icon}
              </span>
            )}

            <span className="app-tabs__label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AppTabs;
