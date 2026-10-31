import type { CSSProperties, ReactNode } from "react";
import { Modal } from "antd";
import "./AppModal.css";

export interface AppModalProps {
  open: boolean;
  title?: ReactNode;
  children?: ReactNode;

  width?: number | string;
  footer?: ReactNode | null;

  onCancel: () => void;

  className?: string;
  style?: CSSProperties;
  maskClosable?: boolean;
  destroyOnHidden?: boolean;
  centered?: boolean;
  closable?: boolean;
}

function AppModal({
  open,
  title,
  children,
  width = 560,
  footer,
  onCancel,
  className = "",
  style,
  maskClosable = false,
  destroyOnHidden = true,
  centered = true,
  closable = true,
}: AppModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      width={width}
      centered={centered}
      footer={footer}
      onCancel={onCancel}
      maskClosable={maskClosable}
      destroyOnHidden={destroyOnHidden}
      closable={closable}
      className={`app-modal ${className}`}
      style={style}>
      {children}
    </Modal>
  );
}

export default AppModal;
