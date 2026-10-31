import type { CSSProperties, ReactNode } from "react";
import AppIconButton from "../AppIconButton";
import "./AppActionPanel.css";

export interface AppActionPanelItem {
  key: string;
  icon: ReactNode;
  tooltip: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
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
      {actions.map((action) => (
        <div key={action.key} className="app-action-panel__item">
          <AppIconButton
            icon={action.icon}
            tooltip={action.tooltip}
            onClick={action.onClick}
            danger={action.danger}
            disabled={action.disabled}
            size={80}
            iconSize={24}
            className="app-action-panel__button"
          />
        </div>
      ))}
    </div>
  );
}

export default AppActionPanel;
