import { useRef } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import "./AppTabs.css";

export interface AppTabItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface AppTabsProps {
  items: AppTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

function AppTabs({
  items,
  activeKey,
  onChange,
  className = "",
  style,
  ariaLabel = "Danh mục nội dung",
}: AppTabsProps) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const enabledItems = items.filter((item) => !item.disabled);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentKey: string,
  ) => {
    const currentIndex = enabledItems.findIndex(
      (item) => item.key === currentKey,
    );

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % enabledItems.length;
        break;

      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = enabledItems.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextKey = enabledItems[nextIndex].key;
    tabRefs.current.get(nextKey)?.focus();
    onChange(nextKey);
  };

  return (
    <div
      className={`app-tabs ${className}`.trim()}
      style={style}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal">
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            ref={(element) => {
              if (element) {
                tabRefs.current.set(item.key, element);
              } else {
                tabRefs.current.delete(item.key);
              }
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive && !item.disabled ? 0 : -1}
            disabled={item.disabled}
            className={[
              "app-tabs__item",
              isActive ? "app-tabs__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => handleKeyDown(event, item.key)}>
            <span className="app-tabs__label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AppTabs;
