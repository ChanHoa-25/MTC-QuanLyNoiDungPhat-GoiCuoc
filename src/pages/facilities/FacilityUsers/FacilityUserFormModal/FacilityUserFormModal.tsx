import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { Form, Input, message } from "antd";
import { Camera, UserRound } from "lucide-react";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import type { FacilityUser } from "../../types/facilityUser.types";

import "./FacilityUserFormModal.css";

export interface FacilityUserFormValues {
  username: string;
  password?: string;
  fullName: string;
  identityNumber?: string;
  phone: string;
  email: string;
  roleId: string;
  avatar?: File;
}

interface RoleOption {
  label: string;
  value: string;
}

interface FacilityUserFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<FacilityUser> & {
    roleId?: string | null;
  };
  loading?: boolean;
  roleOptions?: RoleOption[];
  onCancel: () => void;
  onSubmit: (values: FacilityUserFormValues) => void;
}

function FacilityUserFormModal({
  open,
  mode = "edit",
  initialValues,
  loading = false,
  roleOptions = [],
  onCancel,
  onSubmit,
}: FacilityUserFormModalProps) {
  const [form] = Form.useForm<FacilityUserFormValues>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const isEdit = mode === "edit";

  const username = initialValues?.username;
  const fullName = initialValues?.fullName;
  const identityNumber = initialValues?.identityNumber;
  const phone = initialValues?.phone;
  const email = initialValues?.email;
  const roleId = initialValues?.roleId;

  // Khởi tạo dữ liệu khi mở modal
  useEffect(() => {
    if (!open) return;

    form.resetFields();

    if (isEdit) {
      form.setFieldsValue({
        username: username ?? "",
        fullName: fullName ?? "",
        identityNumber: identityNumber ?? "",
        phone: phone ?? "",
        email: email ?? "",
        roleId: roleId ?? undefined,
      });
    } else {
      form.setFieldsValue({
        username: "",
        password: "",
        fullName: "",
        identityNumber: "",
        phone: "",
        email: "",
        roleId: undefined,
      });
    }

    setAvatarPreview(null);
    setAvatarFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [
    open,
    isEdit,
    form,
    username,
    fullName,
    identityNumber,
    phone,
    email,
    roleId,
  ]);

  // Giải phóng URL ảnh khi thay đổi hoặc đóng modal
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Chọn ảnh đại diện
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

  // Xử lý dữ liệu form
  const handleSubmit = (values: FacilityUserFormValues) => {
    if (loading) return;

    const submitValues: FacilityUserFormValues = {
      ...values,
      username: values.username.trim(),
      fullName: values.fullName.trim(),
      identityNumber: values.identityNumber?.trim() ?? "",
      phone: values.phone.trim(),
      email: values.email.trim(),
      roleId: values.roleId,
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
      width={500}
      className="facility-user-form-modal"
      onCancel={handleCancel}
      footer={null}>
      <AppForm<FacilityUserFormValues>
        form={form}
        columns={1}
        onFinish={handleSubmit}>
        <div className="facility-user-form-modal__fields">
          {/* Tên đăng nhập */}
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
              height={40}
              placeholder="Nhập tên đăng nhập"
              disabled={isEdit}
            />
          </Form.Item>

          {/* Mật khẩu chỉ xuất hiện khi thêm */}
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
                className="facility-user-form-modal__password"
              />
            </Form.Item>
          )}

          {/* Tên người dùng */}
          <Form.Item label="Tên người dùng" name="fullName">
            <AppInput
              width="100%"
              height={40}
              placeholder="Nhập tên người dùng"
            />
          </Form.Item>

          {/* CMND/CCCD */}
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
              height={40}
              placeholder="Nhập số CMND/CCCD"
              disabled={isEdit}
            />
          </Form.Item>

          {/* Số điện thoại */}
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
              height={40}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>

          {/* Email */}
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
            <AppInput width="100%" height={40} placeholder="Nhập email" />
          </Form.Item>

          {/* Vai trò */}
          <Form.Item
            label="Vai trò"
            name="roleId"
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

        {/* Hình đại diện */}
        <div className="facility-user-form-modal__avatar-section">
          <span className="facility-user-form-modal__avatar-label">
            Hình đại diện
          </span>

          <div className="facility-user-form-modal__avatar">
            {avatarPreview ||
            (isEdit && typeof initialValues?.avatar === "string") ? (
              <img
                src={avatarPreview ?? (initialValues?.avatar as string)}
                alt="Ảnh đại diện"
                className="facility-user-form-modal__avatar-image"
              />
            ) : (
              <UserRound
                size={46}
                strokeWidth={1.5}
                className="facility-user-form-modal__avatar-placeholder"
              />
            )}

            <button
              type="button"
              className="facility-user-form-modal__camera"
              aria-label="Chọn ảnh đại diện"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}>
              <Camera size={13} strokeWidth={2} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={loading}
            className="facility-user-form-modal__file-input"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Ghi chú trường bắt buộc */}
        <div className="facility-user-form-modal__required-note">
          <span>*</span>
          <span>là những trường thông tin bắt buộc</span>
        </div>

        {/* Nút hành động */}
        <div className="app-form-actions facility-user-form-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            height={40}
            disabled={loading}
            onClick={handleCancel}>
            Hủy
          </AppButton>

          <AppButton
            width={120}
            height={40}
            htmlType="submit"
            loading={loading}>
            Lưu
          </AppButton>
        </div>
      </AppForm>
    </AppModal>
  );
}

export default FacilityUserFormModal;
