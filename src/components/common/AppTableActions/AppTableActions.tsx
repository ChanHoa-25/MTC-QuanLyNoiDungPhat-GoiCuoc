import type { CSSProperties, ReactNode } from "react";
import AppIconButton from "../AppIconButton";
import "./AppTableActions.css";

export interface AppTableActionItem {
  key: string;
  icon: ReactNode;
  tooltip: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface AppTableActionsProps {
  actions: AppTableActionItem[];
  className?: string;
  style?: CSSProperties;
}

function AppTableActions({
  actions,
  className = "",
  style,
}: AppTableActionsProps) {
  return (
    <div className={`app-table-actions ${className}`.trim()} style={style}>
      {actions.map((action) => (
        <AppIconButton
          key={action.key}
          icon={action.icon}
          tooltip={action.tooltip}
          onClick={action.onClick}
          danger={action.danger}
          disabled={action.disabled}
          size={32}
          iconSize={20}
        />
      ))}
    </div>
  );
}

export default AppTableActions;
