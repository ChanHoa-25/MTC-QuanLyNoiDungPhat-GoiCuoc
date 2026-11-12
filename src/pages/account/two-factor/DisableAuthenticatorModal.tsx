import { Form, Input } from "antd";

import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";

interface DisableAuthenticatorFormValues {
  password: string;
  code: string;
}

interface DisableAuthenticatorModalProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (values: DisableAuthenticatorFormValues) => void;
}

function DisableAuthenticatorModal({
  open,
  loading = false,
  onCancel,
  onConfirm,
}: DisableAuthenticatorModalProps) {
  const [form] = Form.useForm<DisableAuthenticatorFormValues>();

  const handleCancel = () => {
    if (loading) return;

    form.resetFields();
    onCancel();
  };

  const handleConfirm = (values: DisableAuthenticatorFormValues) => {
    onConfirm(values);
  };

  return (
    <AppModal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      closable={!loading}>
      <h2>Tắt xác thực hai bước?</h2>

      <p>
        Vui lòng nhập mật khẩu hiện tại và mã xác thực từ ứng dụng Authenticator
        để xác nhận.
      </p>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleConfirm}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="password"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu hiện tại!",
            },
          ]}>
          <Input.Password
            placeholder="Nhập mật khẩu hiện tại"
            size="large"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          label="Mã xác thực"
          name="code"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mã xác thực!",
            },
            {
              pattern: /^\d{6}$/,
              message: "Mã xác thực phải gồm 6 chữ số!",
            },
          ]}>
          <Input.OTP
            length={6}
            size="large"
            formatter={(value) => value.replace(/\D/g, "")}
            disabled={loading}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}>
          <AppButton
            variant="outline"
            width={130}
            height={44}
            disabled={loading}
            onClick={handleCancel}>
            Hủy
          </AppButton>

          <AppButton
            variant="primary"
            width={150}
            height={44}
            disabled={loading}
            onClick={() => form.submit()}>
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
}

export default DisableAuthenticatorModal;
