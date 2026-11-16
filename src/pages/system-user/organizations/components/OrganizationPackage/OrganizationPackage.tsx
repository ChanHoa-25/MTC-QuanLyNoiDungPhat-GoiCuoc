import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import "./OrganizationPackage.css";

import AppModal from "../../../../../components/common/AppModal";
import AppButton from "../../../../../components/common/AppButton";
import AppInput from "../../../../../components/common/AppInput";
import AppSelect from "../../../../../components/common/AppSelect";
import AppDatePicker from "../../../../../components/common/AppDatePicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (data: PackageFormData) => void;
}

type PackageMode = "available" | "custom";
type DurationUnit = "month" | "year";

interface AvailablePackage {
  id: string;
  name: string;
  capacity: string;
  duration: number;
  durationUnit: DurationUnit;
  price: number;
}

interface PackageFormData {
  mode: PackageMode;
  packageId?: string;
  capacity: string;
  duration: number;
  durationUnit: DurationUnit;
  effectiveDate: string;
  expiryDate: string;
  price: number;
}

interface FormErrors {
  packageId?: string;
  capacity?: string;
  duration?: string;
  effectiveDate?: string;
  price?: string;
}

const AVAILABLE_PACKAGES: AvailablePackage[] = [];

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const parseMoney = (value: string): number => {
  return Number(value.replace(/[^\d]/g, "")) || 0;
};

const calculateExpiryDate = (
  startDate: Dayjs | null,
  duration: number,
  unit: DurationUnit,
): Dayjs | null => {
  if (!startDate || duration <= 0) return null;

  return startDate.add(duration, unit === "year" ? "year" : "month");
};

const OrganizationPackage: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [mode, setMode] = useState<PackageMode>("available");
  const [packageId, setPackageId] = useState<string>();
  const [capacity, setCapacity] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("month");
  const [effectiveDate, setEffectiveDate] = useState<Dayjs | null>(null);
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedPackage = AVAILABLE_PACKAGES.find(
    (item) => item.id === packageId,
  );

  const isAvailable = mode === "available";

  const currentCapacity = isAvailable
    ? selectedPackage?.capacity || ""
    : capacity;

  const currentDuration = isAvailable
    ? selectedPackage?.duration || 0
    : Number(duration);

  const currentDurationUnit = isAvailable
    ? selectedPackage?.durationUnit || "month"
    : durationUnit;

  const currentPrice = isAvailable
    ? selectedPackage?.price || 0
    : parseMoney(price);

  const expiryDate = calculateExpiryDate(
    effectiveDate,
    currentDuration,
    currentDurationUnit,
  );

  useEffect(() => {
    if (!open) return;

    setMode("available");
    setPackageId(undefined);
    setCapacity("");
    setDuration("");
    setDurationUnit("month");
    setEffectiveDate(null);
    setPrice("");
    setErrors({});
  }, [open]);

  const handleModeChange = (value: PackageMode) => {
    setMode(value);
    setErrors({});
  };

  const handleCapacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^\d]/g, "");
    setCapacity(value);
    setErrors((prev) => ({ ...prev, capacity: undefined }));
  };

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^\d]/g, "");
    setDuration(value);
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^\d]/g, "");
    setPrice(value);
    setErrors((prev) => ({ ...prev, price: undefined }));
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (isAvailable && !packageId) {
      nextErrors.packageId = "Vui lòng chọn gói cước";
    }

    if (!isAvailable) {
      if (!capacity || Number(capacity) <= 0) {
        nextErrors.capacity = "Vui lòng nhập dung lượng hợp lệ";
      }

      if (!duration || Number(duration) <= 0) {
        nextErrors.duration = "Vui lòng nhập thời hạn hợp lệ";
      }

      if (!price || parseMoney(price) <= 0) {
        nextErrors.price = "Vui lòng nhập giá tiền hợp lệ";
      }
    }

    if (!effectiveDate) {
      nextErrors.effectiveDate = "Vui lòng chọn thời gian hiệu lực";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || !effectiveDate || !expiryDate) {
      return;
    }

    const payload: PackageFormData = {
      mode,
      packageId: isAvailable ? packageId : undefined,
      capacity: currentCapacity,
      duration: currentDuration,
      durationUnit: currentDurationUnit,
      effectiveDate: effectiveDate.format("DD/MM/YYYY"),
      expiryDate: expiryDate.format("DD/MM/YYYY"),
      price: currentPrice,
    };

    onSave?.(payload);
    onClose();
  };

  return (
    <AppModal
      open={open}
      title="Thay đổi gói cước"
      width={560}
      onCancel={onClose}
      footer={
        <div className="org-pkg-footer">
          <AppButton variant="outline" width={120} onClick={onClose}>
            Hủy
          </AppButton>

          <AppButton variant="primary" width={120} onClick={handleSave}>
            Lưu
          </AppButton>
        </div>
      }>
      <div className="org-pkg-modal">
        <div className="org-pkg-radio-group">
          <label className="org-pkg-radio-label">
            <input
              type="radio"
              name="organizationPackageMode"
              className="org-pkg-radio"
              checked={isAvailable}
              onChange={() => handleModeChange("available")}
            />
            <span>Gói có sẵn</span>
          </label>

          <label className="org-pkg-radio-label">
            <input
              type="radio"
              name="organizationPackageMode"
              className="org-pkg-radio"
              checked={!isAvailable}
              onChange={() => handleModeChange("custom")}
            />
            <span>Gói khác</span>
          </label>
        </div>

        {isAvailable ? (
          <>
            <div className="org-pkg-field org-pkg-field--half">
              <label className="org-pkg-label">
                Gói cước
                <sup className="org-pkg-required">*</sup>
              </label>

              <AppSelect
                width="100%"
                placeholder="Chọn gói cước"
                value={packageId}
                onChange={(value) => {
                  setPackageId(
                    value === undefined || value === null
                      ? undefined
                      : String(value),
                  );
                  setErrors((prev) => ({
                    ...prev,
                    packageId: undefined,
                  }));
                }}
                options={AVAILABLE_PACKAGES.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />

              {errors.packageId && (
                <span className="org-pkg-error">{errors.packageId}</span>
              )}
            </div>

            <div className="org-pkg-grid-2">
              <div className="org-pkg-field">
                <label className="org-pkg-label">
                  Dung lượng
                  <sup className="org-pkg-required">*</sup>
                </label>

                <AppInput
                  width="100%"
                  value={
                    selectedPackage ? `${selectedPackage.capacity} GB` : ""
                  }
                  placeholder="Dung lượng"
                  disabled
                />
              </div>

              <div className="org-pkg-field">
                <label className="org-pkg-label">
                  Thời hạn
                  <sup className="org-pkg-required">*</sup>
                </label>

                <AppInput
                  width="100%"
                  value={
                    selectedPackage
                      ? `${selectedPackage.duration} ${
                          selectedPackage.durationUnit === "year"
                            ? "Năm"
                            : "Tháng"
                        }`
                      : ""
                  }
                  placeholder="Thời hạn"
                  disabled
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="org-pkg-field org-pkg-field--half">
              <label className="org-pkg-label">
                Dung lượng
                <sup className="org-pkg-required">*</sup>
              </label>

              <AppInput
                width="100%"
                placeholder="Nhập số GB"
                value={capacity}
                onChange={handleCapacityChange}
                suffix="GB"
              />

              {errors.capacity && (
                <span className="org-pkg-error">{errors.capacity}</span>
              )}
            </div>

            <div className="org-pkg-field">
              <label className="org-pkg-label">
                Thời hạn
                <sup className="org-pkg-required">*</sup>
              </label>

              <div className="org-pkg-grid-2">
                <AppSelect
                  width="100%"
                  placeholder="Chọn loại"
                  value={durationUnit}
                  onChange={(value) => {
                    setDurationUnit(value as DurationUnit);
                  }}
                  options={[
                    { label: "Tháng", value: "month" },
                    { label: "Năm", value: "year" },
                  ]}
                />

                <AppInput
                  width="100%"
                  placeholder="Nhập thời hạn"
                  value={duration}
                  onChange={handleDurationChange}
                  suffix={durationUnit === "year" ? "Năm" : "Tháng"}
                />
              </div>

              {errors.duration && (
                <span className="org-pkg-error">{errors.duration}</span>
              )}
            </div>
          </>
        )}

        <div className="org-pkg-grid-2">
          <div className="org-pkg-field">
            <label className="org-pkg-label">
              Thời gian hiệu lực
              <sup className="org-pkg-required">*</sup>
            </label>

            <AppDatePicker
              width="100%"
              value={effectiveDate}
              onChange={(value) => {
                setEffectiveDate(value);
                setErrors((prev) => ({
                  ...prev,
                  effectiveDate: undefined,
                }));
              }}
              placeholder="12/12/2023"
            />

            {errors.effectiveDate && (
              <span className="org-pkg-error">{errors.effectiveDate}</span>
            )}
          </div>

          <div className="org-pkg-field">
            <label className="org-pkg-label">Thời gian hết hạn</label>

            <AppInput
              width="100%"
              value={expiryDate ? expiryDate.format("DD/MM/YYYY") : ""}
              placeholder="12/12/2023"
              disabled
            />
          </div>
        </div>

        <div className="org-pkg-field org-pkg-field--half">
          <label className="org-pkg-label">
            Giá tiền
            <sup className="org-pkg-required">*</sup>
          </label>

          <AppInput
            width="100%"
            value={
              isAvailable
                ? selectedPackage
                  ? formatMoney(selectedPackage.price)
                  : ""
                : price
                  ? formatMoney(parseMoney(price))
                  : ""
            }
            onChange={isAvailable ? undefined : handlePriceChange}
            placeholder="Nhập số tiền"
            suffix="VND"
            disabled={isAvailable}
          />

          {errors.price && (
            <span className="org-pkg-error">{errors.price}</span>
          )}
        </div>

        {!isAvailable && (
          <div className="org-pkg-summary">
            <div>- 100.000 VND</div>
            <div className="org-pkg-summary-total">
              Tổng thực thu{" "}
              {formatMoney(Math.max(0, parseMoney(price) - 100000))} VND
            </div>
          </div>
        )}

        <p className="org-pkg-required-note">
          <span>*</span> là những trường thông tin bắt buộc
        </p>
      </div>
    </AppModal>
  );
};

export default OrganizationPackage;
