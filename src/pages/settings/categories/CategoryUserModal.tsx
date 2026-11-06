import { useEffect } from "react";
import { Form } from "antd";

import AppModal from "../../../components/common/AppModal";
import AppForm from "../../../components/common/AppForm";
import AppInput from "../../../components/common/AppInput";
import AppSelect from "../../../components/common/AppSelect";
import AppButton from "../../../components/common/AppButton";

import type {
  CategoryUser,
  CategoryUserFormValues,
} from "../types/categoryUsers.types";

import "./CategoryUserModal.css";

interface CategoryUserModalProps {
  open: boolean;
  user: CategoryUser | null;
  onSave: (values: CategoryUserFormValues) => void;
  onCancel: () => void;
}

function CategoryUserModal({
  open,
  user,
  onSave,
  onCancel,
}: CategoryUserModalProps) {
  const [form] = Form.useForm<CategoryUserFormValues>();

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    if (user) {
      form.setFieldsValue({
        username: user.username,
        fullName: user.fullName,
        identityNumber: user.identityNumber,
        phone: user.phone,
        email: user.email,
        role: user.role,
      });
    }
  }, [open, user, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      onSave({
        username: values.username.trim(),
        fullName: (values.fullName ?? "").trim(),
        identityNumber: (values.identityNumber ?? "").trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        role: values.role,
      });
    } catch {
      return;
    }
  };

  return (
    <AppModal
      open={open}
      title={null}
      width={525}
      onCancel={onCancel}
      className="category-user-modal"
      footer={
        <div className="category-user-modal__footer">
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
      <h2 className="category-user-modal__title">
        Cập nhật tài khoản quản trị
      </h2>

      <AppForm<CategoryUserFormValues>
        form={form}
        layout="vertical"
        requiredMark
        className="category-user-modal__form">
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập tên đăng nhập",
            },
          ]}>
          <AppInput width="100%" placeholder="Nhập tên đăng nhập" />
        </Form.Item>

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
              required: true,
              whitespace: true,
              message: "Vui lòng nhập số điện thoại",
            },
            {
              pattern: /^0\d{9}$/,
              message: "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0",
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
            options={[
              { label: "Quản trị viên", value: "Admin" },
              { label: "Người dùng", value: "User" },
            ]}
          />
        </Form.Item>
      </AppForm>

      <p className="category-user-modal__note">
        <span>*</span> là những trường thông tin bắt buộc
      </p>
    </AppModal>
  );
}

export default CategoryUserModal;
