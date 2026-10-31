import { Modal } from "antd";
import type { ModalProps } from "antd";
import "./AppModal.css";

export interface AppModalProps extends ModalProps {}

function AppModal({
  open,
  title,
  children,
  width = 560,
  footer = null,
  onCancel,
  className = "",
  style,
  maskClosable = false,
  destroyOnHidden = true,
  centered = true,
  closable = true,
  ...props
}: AppModalProps) {
  return (
    <Modal
      {...props}
      open={open}
      title={title}
      width={width}
      footer={footer}
      onCancel={onCancel}
      centered={centered}
      maskClosable={maskClosable}
      destroyOnHidden={destroyOnHidden}
      closable={closable}
      className={`app-modal ${className}`.trim()}
      style={style}>
      {children}
    </Modal>
  );
}

export default AppModal;
