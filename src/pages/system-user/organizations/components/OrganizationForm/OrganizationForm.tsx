import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { Dayjs } from "dayjs";

import AppModal from "../../../../../components/common/AppModal";
import AppButton from "../../../../../components/common/AppButton";
import AppInput from "../../../../../components/common/AppInput";
import AppSelect from "../../../../../components/common/AppSelect";
import AppDatePicker from "../../../../../components/common/AppDatePicker";

import type { OrganizationItem } from "../../types/organization.types";

import "./OrganizationForm.css";

dayjs.extend(customParseFormat);

type PackageType = "available" | "other";

interface OrganizationFormData {
  code: string;
  name: string;
  lastName: string;
  firstName: string;
  phone: string;
  birthday: string;
  username: string;
  password: string;
  email: string;
  timezone: string;
  packageType: PackageType;
  capacity: string;
  duration: string;
  effectiveDate: string;
  expiryDate: string;
  price: string;
  autoRenew: boolean;
}

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialData?: OrganizationItem | null;
  onClose: () => void;
  onSubmit: (data: OrganizationFormData) => void;
}

type FormErrors = Partial<Record<keyof OrganizationFormData, string>>;

const initialForm: OrganizationFormData = {
  code: "",
  name: "",
  lastName: "",
  firstName: "",
  phone: "",
  birthday: "",
  username: "",
  password: "",
  email: "",
  timezone: "Hà Nội (GMT+07:00)",
  packageType: "other",
  capacity: "",
  duration: "",
  effectiveDate: "",
  expiryDate: "",
  price: "",
  autoRenew: true,
};

const parseDate = (value: string): Dayjs | null => {
  if (!value || value === "—") return null;

  const parsed = dayjs(value, "DD/MM/YYYY", true);

  return parsed.isValid() ? parsed : null;
};

const formatDate = (value: Dayjs | null): string => {
  return value ? value.format("DD/MM/YYYY") : "";
};

const OrganizationForm: React.FC<Props> = ({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState<OrganizationFormData>({
    ...initialForm,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (isEdit && initialData) {
      setForm({
        ...initialForm,
        code: initialData.code || "",
        name: initialData.name || "",
        lastName: initialData.representativeLastName || "",
        firstName: initialData.representativeFirstName || "",
        phone: initialData.phone || "",
        birthday: initialData.birthday || "",
        username: initialData.username || "",
        email: initialData.email || "",
        timezone: initialData.timezone || "Hà Nội (GMT+07:00)",
        effectiveDate: initialData.effectiveDate || "",
        expiryDate: initialData.expiryDate || "",
      });
    } else {
      setForm({ ...initialForm });
    }
  }, [open, isEdit, initialData]);

  const updateField = <K extends keyof OrganizationFormData>(
    field: K,
    value: OrganizationFormData[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    const requiredFields: Array<keyof OrganizationFormData> = [
      "code",
      "name",
      "lastName",
      "firstName",
      "phone",
      "username",
      "email",
      "timezone",
    ];

    if (!isEdit) {
      requiredFields.push(
        "password",
        "capacity",
        "duration",
        "effectiveDate",
        "price",
      );
    }

    requiredFields.forEach((field) => {
      const value = form[field];

      if (typeof value === "string" && !value.trim()) {
        nextErrors[field] = "Vui lòng nhập thông tin bắt buộc";
      }
    });

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Email không hợp lệ";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload: OrganizationFormData = {
      ...form,
      code: isEdit && initialData ? initialData.code : form.code.trim(),
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      phone: form.phone.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
    };

    onSubmit(payload);
  };

  const renderError = (field: keyof OrganizationFormData) => {
    if (!errors[field]) return null;

    return <span className="org-form-error">{errors[field]}</span>;
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật thông tin tổ chức" : "Thêm tổ chức"}
      width={560}
      onCancel={onClose}
      footer={
        <div className="org-modal-footer">
          <AppButton variant="outline" width={120} onClick={onClose}>
            Hủy
          </AppButton>

          <AppButton type="primary" width={120} onClick={handleSubmit}>
            {isEdit ? "Cập nhật" : "Tạo tổ chức"}
          </AppButton>
        </div>
      }>
      <div
        className={`org-modal-form-scroll ${
          isEdit ? "org-modal-form--edit" : "org-modal-form--create"
        }`}>
        <section className="org-form-section">
          <h4 className="org-form-section-title">Thông tin tổ chức</h4>

          <div className="org-form-field">
            <label className="org-form-label">
              Mã định danh tổ chức
              <span className="org-form-required">*</span>
            </label>

            <AppInput
              width="100%"
              placeholder="Nhập mã định danh tổ chức"
              value={form.code}
              disabled={isEdit}
              onChange={(e) => updateField("code", e.target.value)}
            />
            {renderError("code")}
          </div>

          <div className="org-form-field">
            <label className="org-form-label">
              Tên tổ chức
              <span className="org-form-required">*</span>
            </label>

            <AppInput
              width="100%"
              placeholder="Nhập tên tổ chức"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {renderError("name")}
          </div>

          {isEdit && (
            <div className="org-form-auto-renew">
              <span className="org-form-auto-renew__label">
                Gia hạn tự động:
              </span>

              <Switch
                className="org-form-auto-renew__switch"
                checked={form.autoRenew}
                onChange={(checked) => updateField("autoRenew", checked)}
              />
            </div>
          )}
        </section>

        <section className="org-form-section">
          <h4 className="org-form-section-title">Thông tin tài khoản</h4>

          <div className="org-form-grid-2">
            <div className="org-form-field">
              <label className="org-form-label">
                Họ
                <span className="org-form-required">*</span>
              </label>

              <AppInput
                width="100%"
                placeholder="Nguyễn"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
              {renderError("lastName")}
            </div>

            <div className="org-form-field">
              <label className="org-form-label">
                Tên
                <span className="org-form-required">*</span>
              </label>

              <AppInput
                width="100%"
                placeholder="Chinh"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
              {renderError("firstName")}
            </div>
          </div>

          <div className="org-form-grid-2">
            <div className="org-form-field">
              <label className="org-form-label">
                Số điện thoại
                <span className="org-form-required">*</span>
              </label>

              <AppInput
                width="100%"
                placeholder="+84 250 137 008"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              {renderError("phone")}
            </div>

            <div className="org-form-field">
              <label className="org-form-label">Ngày sinh</label>

              <AppDatePicker
                width="100%"
                placeholder="02/02/1998"
                value={parseDate(form.birthday)}
                onChange={(date) => updateField("birthday", formatDate(date))}
              />
            </div>
          </div>

          <div className="org-form-grid-2">
            <div className="org-form-field">
              <label className="org-form-label">
                Tên đăng nhập
                <span className="org-form-required">*</span>
              </label>

              <AppInput
                width="100%"
                placeholder="Nguyễn"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
              />
              {renderError("username")}
            </div>

            {!isEdit && (
              <div className="org-form-field">
                <label className="org-form-label">
                  Mật khẩu
                  <span className="org-form-required">*</span>
                </label>

                <AppInput
                  width="100%"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
                {renderError("password")}
              </div>
            )}
          </div>

          <div className="org-form-field">
            <label className="org-form-label">
              Email
              <span className="org-form-required">*</span>
            </label>

            <AppInput
              width="100%"
              type="email"
              placeholder="chinhnguyen889@gmail.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            {renderError("email")}
          </div>

          <div className="org-form-field">
            <label className="org-form-label">
              Múi giờ
              <span className="org-form-required">*</span>
            </label>

            <AppSelect
              width="100%"
              value={form.timezone}
              onChange={(value) => updateField("timezone", String(value ?? ""))}
              options={[
                {
                  label: "Hà Nội (GMT+07:00)",
                  value: "Hà Nội (GMT+07:00)",
                },
              ]}
            />
            {renderError("timezone")}
          </div>
        </section>

        {!isEdit && (
          <section className="org-form-section">
            <h4 className="org-form-section-title">
              Thông tin gói cước sử dụng
            </h4>

            <div className="org-form-radio-group">
              <label className="org-form-radio-label">
                <input
                  type="radio"
                  name="organization-package"
                  className="org-form-radio"
                  checked={form.packageType === "available"}
                  onChange={() => updateField("packageType", "available")}
                />
                <span>Gói có sẵn</span>
              </label>

              <label className="org-form-radio-label">
                <input
                  type="radio"
                  name="organization-package"
                  className="org-form-radio"
                  checked={form.packageType === "other"}
                  onChange={() => updateField("packageType", "other")}
                />
                <span>Gói khác</span>
              </label>
            </div>

            <div className="org-form-grid-2">
              <div className="org-form-field">
                <label className="org-form-label">
                  Dung lượng
                  <span className="org-form-required">*</span>
                </label>

                <AppInput
                  width="100%"
                  placeholder="Nhập số GB"
                  value={form.capacity}
                  onChange={(e) => updateField("capacity", e.target.value)}
                />
                {renderError("capacity")}
              </div>

              <div className="org-form-field">
                <label className="org-form-label">
                  Thời hạn
                  <span className="org-form-required">*</span>
                </label>

                <AppSelect
                  width="100%"
                  placeholder="Chọn loại"
                  value={form.duration || undefined}
                  onChange={(value) =>
                    updateField("duration", String(value ?? ""))
                  }
                  options={[
                    {
                      label: "Tháng",
                      value: "Tháng",
                    },
                  ]}
                />
                {renderError("duration")}
              </div>
            </div>

            <div className="org-form-grid-2">
              <div className="org-form-field">
                <label className="org-form-label">
                  Thời gian gia hạn
                  <span className="org-form-required">*</span>
                </label>

                <AppDatePicker
                  width="100%"
                  placeholder="12/12/2023"
                  value={parseDate(form.effectiveDate)}
                  onChange={(date) =>
                    updateField("effectiveDate", formatDate(date))
                  }
                />
                {renderError("effectiveDate")}
              </div>

              <div className="org-form-field">
                <label className="org-form-label">Thời gian hết hạn</label>

                <AppInput
                  width="100%"
                  value={form.expiryDate}
                  disabled
                  placeholder="12/12/2023"
                />
              </div>
            </div>

            <div className="org-form-grid-2">
              <div className="org-form-field">
                <label className="org-form-label">
                  Giá tiền
                  <span className="org-form-required">*</span>
                </label>

                <div className="org-form-price-input">
                  <AppInput
                    width="100%"
                    placeholder="Nhập số tiền"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                  />

                  <span className="org-form-currency">VND</span>
                </div>

                {renderError("price")}
              </div>
            </div>
          </section>
        )}

        <p className="org-form-required-note">
          <span>*</span> là những trường thông tin bắt buộc
        </p>
      </div>
    </AppModal>
  );
};

export default OrganizationForm;
