import type { ReactNode } from "react";
import { Trash2, Check, RefreshCw } from "lucide-react";

import AppModal from "../AppModal";
import AppButton from "../AppButton";
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
  {
    icon: ReactNode;
    className: string;
  }
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

  const handleCancel = () => {
    if (!confirmLoading) {
      onCancel();
    }
  };

  const footer = (
    <div className="app-confirm-modal__actions">
      <AppButton
        variant="outline"
        width={120}
        className="app-confirm-modal__cancel"
        onClick={handleCancel}
        disabled={confirmLoading}>
        {cancelText}
      </AppButton>

      <AppButton
        variant="primary"
        width={120}
        className="app-confirm-modal__confirm"
        loading={confirmLoading}
        disabled={confirmDisabled || confirmLoading}
        onClick={onConfirm}>
        {confirmText}
      </AppButton>
    </div>
  );

  return (
    <AppModal
      open={open}
      width={width}
      onCancel={handleCancel}
      footer={footer}
      className={["app-confirm-modal", config.className, className]
        .filter(Boolean)
        .join(" ")}
      maskClosable={false}
      keyboard={!confirmLoading}
      destroyOnHidden
      closable={false}>
      <div className="app-confirm-modal__icon">{icon ?? config.icon}</div>

      <div className="app-confirm-modal__content">
        <h2 className="app-confirm-modal__title">{title}</h2>

        {description != null && (
          <div className="app-confirm-modal__description">{description}</div>
        )}
      </div>
    </AppModal>
  );
}

export default AppConfirmModal;
