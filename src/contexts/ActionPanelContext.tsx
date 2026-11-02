import { createContext, useContext, useMemo, useState } from "react";

import type { ReactNode } from "react";
import type { AppActionPanelItem } from "../components/common/AppActionPanel";

interface ActionPanelContextValue {
  actions: AppActionPanelItem[];
  setActions: (actions: AppActionPanelItem[]) => void;
}

const ActionPanelContext = createContext<ActionPanelContextValue | null>(null);

interface ActionPanelProviderProps {
  children: ReactNode;
}

export function ActionPanelProvider({ children }: ActionPanelProviderProps) {
  const [actions, setActions] = useState<AppActionPanelItem[]>([]);

  const value = useMemo(
    () => ({
      actions,
      setActions,
    }),
    [actions],
  );

  return (
    <ActionPanelContext.Provider value={value}>
      {children}
    </ActionPanelContext.Provider>
  );
}

export function useActionPanel() {
  const context = useContext(ActionPanelContext);

  if (!context) {
    throw new Error(
      "useActionPanel phải được sử dụng trong ActionPanelProvider",
    );
  }

  return context;
}
