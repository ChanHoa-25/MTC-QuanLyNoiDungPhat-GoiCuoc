import React, { useState } from "react";
import { Form, Input, message } from "antd";
import { Lock, CheckCircle2 } from "lucide-react";
import AppModal from "../common/AppModal";
import AppButton from "../common/AppButton";
import { useAuth } from "../../contexts/AuthContext";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
}) => {
  const { changePassword } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = changePassword(values.oldPassword, values.newPassword);
      setLoading(false);

      if (res.success) {
        message.success("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.");
        form.resetFields();
        onClose();
      } else {
        message.error(res.message);
      }
    } catch {
      // Form validation failed
    }
  };

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={500}
      title="Đổi mật khẩu tài khoản"
      footer={null}>
      <Form form={form} layout="vertical" style={{ paddingTop: 12 }}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="oldPassword"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}>
          <Input.Password
            prefix={<Lock size={16} color="#8C8C8C" />}
            placeholder="Nhập mật khẩu hiện tại"
            style={{ height: 42 }}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu mới phải có tối thiểu 6 ký tự" },
          ]}>
          <Input.Password
            prefix={<Lock size={16} color="#8C8C8C" />}
            placeholder="Nhập mật khẩu mới"
            style={{ height: 42 }}
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
              },
            }),
          ]}>
          <Input.Password
            prefix={<Lock size={16} color="#8C8C8C" />}
            placeholder="Nhập lại mật khẩu mới"
            style={{ height: 42 }}
          />
        </Form.Item>

        <div
          style={{
            background: "#F5F5F5",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 12,
            color: "#666",
            marginBottom: 24,
          }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Yêu cầu mật khẩu an toàn:</div>
          <div>• Tối thiểu 6 ký tự</div>
          <div>• Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <AppButton variant="outline" width={110} onClick={onClose} disabled={loading}>
            Hủy
          </AppButton>
          <AppButton
            variant="primary"
            width={160}
            onClick={handleSubmit}
            loading={loading}
            icon={<CheckCircle2 size={16} />}>
            Đổi mật khẩu
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
};

export default ChangePasswordModal;
