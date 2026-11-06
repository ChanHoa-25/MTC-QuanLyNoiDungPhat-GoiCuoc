import { useEffect } from "react";
import { Form } from "antd";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import type { RoleUser, RoleUserFormValues } from "../../types/roleUsers.types";

import "./RoleUserModal.css";

export type RoleUserModalMode = "create" | "edit";

interface RoleUserModalProps {
  open: boolean;
  mode: RoleUserModalMode;
  user: RoleUser | null;
  existingUsers: RoleUser[];
  roleOptions: { label: string; value: string }[];
  onSave: (values: RoleUserFormValues) => void;
  onCancel: () => void;
}

const statusOptions = [
  { label: "Đang hoạt động", value: "active" },
  { label: "Ngưng hoạt động", value: "inactive" },
];

const timezoneOptions = [
  { label: "Hà Nội (GMT+07:00)", value: "Asia/Ho_Chi_Minh" },
  { label: "Bangkok (GMT+07:00)", value: "Asia/Bangkok" },
  { label: "Singapore (GMT+08:00)", value: "Asia/Singapore" },
];

function RoleUserModal({
  open,
  mode,
  user,
  existingUsers,
  roleOptions,
  onSave,
  onCancel,
}: RoleUserModalProps) {
  const [form] = Form.useForm<RoleUserFormValues>();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    if (isEdit && user) {
      form.setFieldsValue({
        username: user.username,
        fullName: user.fullName,
        identityNumber: user.identityNumber,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
        timezone: user.timezone,
      });
    } else {
      form.setFieldsValue({
        status: "active",
        timezone: "Asia/Ho_Chi_Minh",
      });
    }
  }, [open, isEdit, user, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      onSave({
        ...values,
        username: values.username.trim(),
        fullName: (values.fullName ?? "").trim(),
        identityNumber: (values.identityNumber ?? "").trim(),
        phone: (values.phone ?? "").trim(),
        email: values.email.trim(),
      });
    } catch {
      return;
    }
  };

  return (
    <AppModal
      open={open}
      width={525}
      title={null}
      onCancel={onCancel}
      className="role-user-modal"
      footer={
        <div className="role-user-modal__footer">
          <AppButton
            variant="outline"
            width={120}
            height={44}
            onClick={onCancel}>
            Hủy
          </AppButton>

          <AppButton
            variant="primary"
            width={120}
            height={44}
            onClick={handleSave}>
            Lưu
          </AppButton>
        </div>
      }>
      <h2 className="role-user-modal__title">
        {isEdit ? "Cập nhật" : "Thêm tài khoản quản trị"}
      </h2>

      <AppForm<RoleUserFormValues>
        form={form}
        className="role-user-modal__form">
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập tên đăng nhập",
            },
            {
              validator: async (_, value: string | undefined) => {
                const username = value?.trim().toLowerCase();

                if (!username) return;

                const exists = existingUsers.some(
                  (item) =>
                    item.username.toLowerCase() === username &&
                    item.id !== user?.id,
                );

                if (exists) {
                  throw new Error("Tên đăng nhập đã tồn tại");
                }
              },
            },
          ]}>
          <AppInput
            width="100%"
            disabled={isEdit}
            placeholder="Nhập tên đăng nhập"
          />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu",
              },
              {
                min: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự",
              },
            ]}>
            <AppInput
              type="password"
              width="100%"
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>
        )}

        {isEdit ? (
          <>
            <Form.Item name="phone" label="Số điện thoại">
              <AppInput width="100%" disabled />
            </Form.Item>

            <Form.Item name="identityNumber" label="CMND/CCCD">
              <AppInput width="100%" disabled />
            </Form.Item>

            <Form.Item name="fullName" label="Họ và tên">
              <AppInput width="100%" disabled />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <AppInput width="100%" disabled />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item name="fullName" label="Tên người dùng">
              <AppInput width="100%" placeholder="Nhập tên người dùng" />
            </Form.Item>

            <Form.Item name="identityNumber" label="Số CMND/CCCD">
              <AppInput width="100%" placeholder="Nhập số CMND/CCCD" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^0\d{9}$/,
                  message: "Số điện thoại phải gồm 10 chữ số",
                },
              ]}>
              <AppInput width="100%" placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}>
              <AppInput width="100%" placeholder="Nhập email" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="role"
          label="Vai trò"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn vai trò",
            },
          ]}>
          <AppSelect
            width="100%"
            placeholder="Chọn vai trò"
            options={roleOptions}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn trạng thái",
            },
          ]}>
          <AppSelect
            width="100%"
            placeholder="Chọn trạng thái"
            options={statusOptions}
          />
        </Form.Item>

        <Form.Item
          name="timezone"
          label="Múi giờ"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn múi giờ",
            },
          ]}>
          <AppSelect
            width="100%"
            placeholder="Chọn múi giờ"
            options={timezoneOptions}
          />
        </Form.Item>
      </AppForm>

      <p className="role-user-modal__note">
        <span>*</span> là những trường thông tin bắt buộc
      </p>
    </AppModal>
  );
}

export default RoleUserModal;
