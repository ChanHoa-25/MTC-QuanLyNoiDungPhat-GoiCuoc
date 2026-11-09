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
  role: string;
  avatar?: File;
}

interface FacilityUserFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<FacilityUser>;
  roles?: { label: string; value: string }[];
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: FacilityUserFormValues) => void;
}

const defaultRoleOptions = [
  {
    label: "Quản trị viên",
    value: "aaaaaaaa-0001-0000-0000-000000000000",
  },
  {
    label: "Người phê duyệt",
    value: "aaaaaaaa-0004-0000-0000-000000000000",
  },
  {
    label: "Người tạo nội dung",
    value: "aaaaaaaa-0002-0000-0000-000000000000",
  },
  {
    label: "Kỹ thuật viên",
    value: "aaaaaaaa-0003-0000-0000-000000000000",
  },
];

function FacilityUserFormModal({
  open,
  mode = "edit",
  initialValues,
  roles,
  loading = false,
  onCancel,
  onSubmit,
}: FacilityUserFormModalProps) {
  const [form] = Form.useForm<FacilityUserFormValues>();

  const activeRoleOptions = roles && roles.length > 0 ? roles : defaultRoleOptions;

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
        phone: initialValues.phone ?? initialValues.phoneNumber ?? "",
        email: initialValues.email ?? "",
        role: initialValues.roleId ?? initialValues.role ?? activeRoleOptions[0]?.value,
      });
    } else {
      form.setFieldsValue({
        username: "",
        password: "",
        fullName: "",
        identityNumber: "",
        phone: "",
        email: "",
        role: activeRoleOptions[0]?.value,
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
    activeRoleOptions,
    initialValues?.username,
    initialValues?.fullName,
    initialValues?.identityNumber,
    initialValues?.phone,
    initialValues?.phoneNumber,
    initialValues?.email,
    initialValues?.role,
    initialValues?.roleId,
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

  const handleSubmit = (values: FacilityUserFormValues) => {
    if (loading) return;

    const submitValues: FacilityUserFormValues = {
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
      className="facility-user-form-modal"
      onCancel={handleCancel}
      footer={null}>
      <AppForm<FacilityUserFormValues>
        form={form}
        columns={1}
        onFinish={handleSubmit}>
        <div className="facility-user-form-modal__fields">
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
              readOnly={isEdit}
              disabled={isEdit}
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
                placeholder="VD: Password@123 (chữ hoa, thường, số, ký tự đặc biệt)"
                autoComplete="new-password"
                className="facility-user-form-modal__password"
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
              options={activeRoleOptions}
            />
          </Form.Item>
        </div>

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
                size={54}
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
              <Camera size={14} strokeWidth={2} />
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

        <div className="facility-user-form-modal__required-note">
          <span>*</span>
          <span>là những trường thông tin bắt buộc</span>
        </div>

        <div className="app-form-actions facility-user-form-modal__actions">
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

export default FacilityUserFormModal;
