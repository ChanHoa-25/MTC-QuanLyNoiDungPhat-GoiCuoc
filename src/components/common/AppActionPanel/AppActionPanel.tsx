import type { CSSProperties, ReactNode } from "react";
import { Popover } from "antd";
import AppIconButton from "../AppIconButton";
import "./AppActionPanel.css";

export interface AppActionPanelItem {
  key: string;
  icon: ReactNode;
  tooltip: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;

  // Nội dung Popover nếu action cần hiển thị
  popover?: ReactNode;
  popoverOpen?: boolean;
  onPopoverOpenChange?: (open: boolean) => void;
}

export interface AppActionPanelProps {
  actions: AppActionPanelItem[];
  className?: string;
  style?: CSSProperties;
}

function AppActionPanel({
  actions,
  className = "",
  style,
}: AppActionPanelProps) {
  return (
    <div
      className={`app-action-panel ${className}`.trim()}
      style={style}
      role="group"
      aria-label="Các thao tác">
      {actions.map((action) => {
        const button = (
          <AppIconButton
            icon={action.icon}
            tooltip={action.popover ? "" : action.tooltip}
            onClick={action.onClick}
            danger={action.danger}
            disabled={action.disabled}
            size={80}
            iconSize={24}
            className="app-action-panel__button"
          />
        );

        return (
          <div key={action.key} className="app-action-panel__item">
            {action.popover ? (
              <Popover
                content={action.popover}
                trigger="click"
                placement="bottom"
                open={action.popoverOpen}
                onOpenChange={action.onPopoverOpenChange}
                arrow={false}
                styles={{
                  container: {
                    padding: 0,
                  },
                }}>
                <span
                  style={{
                    display: "inline-flex",
                    cursor: action.disabled ? "not-allowed" : "pointer",
                  }}>
                  {button}
                </span>
              </Popover>
            ) : (
              button
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AppActionPanel;
