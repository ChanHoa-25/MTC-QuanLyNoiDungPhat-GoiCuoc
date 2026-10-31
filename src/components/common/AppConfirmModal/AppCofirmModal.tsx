import type { ReactNode } from "react";
import { Button } from "antd";
import { Trash2, Check, RefreshCw } from "lucide-react";

import AppModal from "../AppModal";
import "./AppConfirmModal.css";

export type ConfirmModalType = "success" | "delete" | "restart";

export interface AppConfirmModalProps {
  open: boolean;
  type?: ConfirmModalType;

  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;

  confirmText?: string;
  cancelText?: string;

  confirmLoading?: boolean;
  confirmDisabled?: boolean;

  width?: number | string;

  onConfirm: () => void;
  onCancel: () => void;

  className?: string;
}

const defaultConfig: Record<
  ConfirmModalType,
  { icon: ReactNode; className: string }
> = {
  success: {
    icon: <Check size={42} strokeWidth={2} />,
    className: "app-confirm-modal--success",
  },

  delete: {
    icon: <Trash2 size={42} strokeWidth={2} />,
    className: "app-confirm-modal--delete",
  },

  restart: {
    icon: <RefreshCw size={42} strokeWidth={2} />,
    className: "app-confirm-modal--restart",
  },
};

function AppConfirmModal({
  open,
  type = "success",
  title,
  description,
  icon,
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  confirmLoading = false,
  confirmDisabled = false,
  width = 500,
  onConfirm,
  onCancel,
  className = "",
}: AppConfirmModalProps) {
  const config = defaultConfig[type];

  const footer = (
    <div className="app-confirm-modal__actions">
      <Button
        className="app-confirm-modal__cancel"
        onClick={onCancel}
        disabled={confirmLoading}>
        {cancelText}
      </Button>

      <Button
        className="app-confirm-modal__confirm"
        loading={confirmLoading}
        disabled={confirmDisabled}
        onClick={onConfirm}>
        {confirmText}
      </Button>
    </div>
  );

  return (
    <AppModal
      open={open}
      width={width}
      onCancel={onCancel}
      footer={footer}
      className={["app-confirm-modal", config.className, className]
        .filter(Boolean)
        .join(" ")}
      maskClosable={false}
      destroyOnHidden
      closable={false}>
      <div className="app-confirm-modal__icon">{icon ?? config.icon}</div>

      <div className="app-confirm-modal__content">
        <h2 className="app-confirm-modal__title">{title}</h2>

        {description && (
          <p className="app-confirm-modal__description">{description}</p>
        )}
      </div>
    </AppModal>
  );
}

export default AppConfirmModal;
