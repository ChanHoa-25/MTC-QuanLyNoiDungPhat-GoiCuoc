import { useState } from "react";
import { Form } from "antd";

import AppModal from "../../../components/common/AppModal/AppModal";
import AppForm from "../../../components/common/AppForm";
import AppInput from "../../../components/common/AppInput";
import AppButton from "../../../components/common/AppButton/AppButton";

import "./VerifyPasswordModal.css";

interface VerifyPasswordModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onVerify: (password: string) => Promise<void>;
}

interface VerifyPasswordValues {
  password: string;
}

function VerifyPasswordModal({
  open,
  loading = false,
  onClose,
  onVerify,
}: VerifyPasswordModalProps) {
  const [form] = Form.useForm<VerifyPasswordValues>();
  const [submitting, setSubmitting] = useState(false);

  const isLoading = loading || submitting;

  const handleClose = () => {
    if (isLoading) return;

    form.resetFields();
    onClose();
  };

  const handleVerify = async (values: VerifyPasswordValues) => {
    if (isLoading) return;

    try {
      setSubmitting(true);

      // Chỉ đóng modal nếu xác minh phía Backend thành công.
      await onVerify(values.password);

      form.resetFields();
    } catch {
      // Parent xử lý thông báo lỗi từ Backend.
      // Giữ modal mở để người dùng nhập lại.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={!isLoading}
      maskClosable={false}
      width={490}
      className="verify-password-modal">
      <h2 className="verify-password-modal__title">Xác minh mật khẩu</h2>

      <p className="verify-password-modal__description">
        Vui lòng nhập lại mật khẩu tài khoản để tiếp tục.
      </p>

      <AppForm<VerifyPasswordValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleVerify}
        className="verify-password-modal__form">
        <Form.Item
          label="Mật khẩu hiện tại"
          name="password"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu hiện tại!",
            },
          ]}>
          <AppInput
            type="password"
            width="100%"
            height={44}
            placeholder="Nhập mật khẩu hiện tại"
            disabled={isLoading}
          />
        </Form.Item>

        <div className="verify-password-modal__actions">
          <AppButton
            variant="outline"
            width={149}
            height={44}
            disabled={isLoading}
            onClick={handleClose}>
            Hủy
          </AppButton>

          <AppButton
            variant="primary"
            width={149}
            height={44}
            disabled={isLoading}
            onClick={() => form.submit()}>
            {isLoading ? "Đang xác minh..." : "Xác nhận"}
          </AppButton>
        </div>
      </AppForm>
    </AppModal>
  );
}

export default VerifyPasswordModal;
