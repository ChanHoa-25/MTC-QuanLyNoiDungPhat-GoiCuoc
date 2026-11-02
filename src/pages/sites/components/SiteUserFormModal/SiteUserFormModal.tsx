import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Form, Input, message } from "antd";
import { Camera, UserRound } from "lucide-react";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import type { SiteUser } from "../../types/siteuser.types";

import "./SiteUserFormModal.css";

export interface SiteUserFormValues {
  username: string;
  password?: string;
  fullName: string;
  identityNumber?: string;
  phone: string;
  email: string;
  role: string;
  avatar?: File;
}

interface SiteUserFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<SiteUser>;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: SiteUserFormValues) => void;
}

const roleOptions = [
  {
    label: "Quản trị viên",
    value: "Group Admin",
  },
];

function SiteUserFormModal({
  open,
  mode = "edit",
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: SiteUserFormModalProps) {
  const [form] = Form.useForm<SiteUserFormValues>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    if (isEdit && initialValues) {
      form.setFieldsValue({
        username: initialValues.username ?? "",
        fullName: initialValues.fullName ?? "",
        identityNumber: initialValues.identityNumber ?? "",
        phone: initialValues.phone ?? "",
        email: initialValues.email ?? "",
        role: initialValues.role ?? "Group Admin",
      });
    } else {
      form.setFieldsValue({
        username: "",
        password: "",
        fullName: "",
        identityNumber: "",
        phone: "",
        email: "",
        role: undefined,
      });
    }

    setAvatarPreview(null);
    setAvatarFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [
    open,
    mode,
    isEdit,
    form,
    initialValues?.username,
    initialValues?.fullName,
    initialValues?.identityNumber,
    initialValues?.phone,
    initialValues?.email,
    initialValues?.role,
  ]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn tệp hình ảnh");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error("Ảnh đại diện không được vượt quá 2MB");
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));

    event.target.value = "";
  };

  const handleCancel = () => {
    if (loading) return;

    onCancel();
  };

  const handleSubmit = (values: SiteUserFormValues) => {
    if (loading) return;

    const submitValues: SiteUserFormValues = {
      ...values,
      username: values.username.trim(),
      fullName: values.fullName?.trim() ?? "",
      identityNumber: values.identityNumber?.trim() ?? "",
      phone: values.phone.trim(),
      email: values.email.trim(),
    };

    if (avatarFile) {
      submitValues.avatar = avatarFile;
    }

    if (isEdit) {
      delete submitValues.password;
    }

    onSubmit(submitValues);
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật tài khoản quản trị" : "Thêm tài khoản quản trị"}
      width={524}
      className="site-user-form-modal"
      onCancel={handleCancel}
      footer={null}>
      <AppForm<SiteUserFormValues>
        form={form}
        columns={1}
        onFinish={handleSubmit}>
        <div className="site-user-form-modal__fields">
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập tên đăng nhập",
              },
            ]}>
            <AppInput
              width="100%"
              height={44}
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>

          {!isEdit && (
            <Form.Item
              label="Mật khẩu"
              name="password"
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
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
                className="site-user-form-modal__password"
              />
            </Form.Item>
          )}

          <Form.Item label="Tên người dùng" name="fullName">
            <AppInput
              width="100%"
              height={44}
              placeholder="Nhập tên người dùng"
            />
          </Form.Item>

          <Form.Item
            label="Số CMND/CCCD"
            name="identityNumber"
            rules={[
              {
                pattern: /^(\d{9}|\d{12})?$/,
                message: "CMND/CCCD phải gồm 9 hoặc 12 chữ số",
              },
            ]}>
            <AppInput
              width="100%"
              height={44}
              placeholder="Nhập số CMND/CCCD"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại",
              },
              {
                pattern: /^0\d{9}$/,
                message: "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0",
              },
            ]}>
            <AppInput
              width="100%"
              height={44}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email",
              },
              {
                type: "email",
                message: "Email không đúng định dạng",
              },
            ]}>
            <AppInput width="100%" height={44} placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
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
        </div>

        <div className="site-user-form-modal__avatar-section">
          <span className="site-user-form-modal__avatar-label">
            Hình đại diện
          </span>

          <div className="site-user-form-modal__avatar">
            {avatarPreview || (isEdit && initialValues?.avatar) ? (
              <img
                src={avatarPreview ?? (initialValues?.avatar as string)}
                alt="Ảnh đại diện"
                className="site-user-form-modal__avatar-image"
              />
            ) : (
              <UserRound
                size={54}
                strokeWidth={1.5}
                className="site-user-form-modal__avatar-placeholder"
              />
            )}

            <button
              type="button"
              className="site-user-form-modal__camera"
              aria-label="Chọn ảnh đại diện"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}>
              <Camera size={14} strokeWidth={2} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={loading}
            className="site-user-form-modal__file-input"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="site-user-form-modal__required-note">
          <span>*</span>
          <span>là những trường thông tin bắt buộc</span>
        </div>

        <div className="app-form-actions site-user-form-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            height={44}
            disabled={loading}
            onClick={handleCancel}>
            Hủy
          </AppButton>

          <AppButton
            width={120}
            height={44}
            htmlType="submit"
            loading={loading}>
            Lưu
          </AppButton>
        </div>
      </AppForm>
    </AppModal>
  );
}

export default SiteUserFormModal;
