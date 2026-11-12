import { useState } from "react";
import { Form, message } from "antd";
import axios from "axios";

import { authApi } from "../../../api/authApi";
import AppModal from "../../../components/common/AppModal/AppModal";
import AppForm from "../../../components/common/AppForm";
import AppInput from "../../../components/common/AppInput";
import AppButton from "../../../components/common/AppButton/AppButton";

import "./ChangePasswordModal.css";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [form] = Form.useForm<ChangePasswordValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    if (saving) return;

    form.resetFields();
    onClose();
  };

  const handleSave = async (values: ChangePasswordValues) => {
    if (saving) return;

    try {
      setSaving(true);

      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });

      messageApi.success("Thay đổi mật khẩu thành công.");

      form.resetFields();
      onClose();
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Không thể thay đổi mật khẩu."
        : error instanceof Error
          ? error.message
          : "Không thể thay đổi mật khẩu.";

      messageApi.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {contextHolder}

      <AppModal
        open={open}
        onCancel={handleClose}
        footer={null}
        closable={false}
        width={490}
        className="change-password-modal">
        <h2 className="change-password-modal__title">Thay đổi mật khẩu</h2>

        <AppForm<ChangePasswordValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSave}
          className="change-password-modal__form">
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu hiện tại!",
              },
            ]}>
            <AppInput
              type="password"
              width="100%"
              placeholder=""
              height={44}
              disabled={saving}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu mới!",
              },
              {
                min: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự!",
              },
            ]}>
            <AppInput
              type="password"
              width="100%"
              placeholder=""
              height={44}
              disabled={saving}
            />
          </Form.Item>

          <Form.Item
            label="Nhập lại mật khẩu mới"
            name="confirmNewPassword"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu mới!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!"),
                  );
                },
              }),
            ]}>
            <AppInput
              type="password"
              placeholder=""
              width="100%"
              height={44}
              disabled={saving}
            />
          </Form.Item>

          <div className="change-password-modal__actions">
            <AppButton
              variant="outline"
              width={149}
              height={44}
              disabled={saving}
              onClick={handleClose}>
              Hủy
            </AppButton>

            <AppButton
              variant="primary"
              width={149}
              height={44}
              disabled={saving}
              onClick={() => form.submit()}>
              {saving ? "Đang lưu..." : "Lưu"}
            </AppButton>
          </div>
        </AppForm>
      </AppModal>
    </>
  );
}

export default ChangePasswordModal;
