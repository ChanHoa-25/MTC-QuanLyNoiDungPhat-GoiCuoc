import { useEffect } from "react";
import { Form, Input } from "antd";
import { MapPin } from "lucide-react";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import type {
  FacilityDevice,
  FacilityDeviceFormValues,
} from "../../types/facilityDevice.types";

import "./FacilityDeviceFormModal.css";

interface FacilityDeviceFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<FacilityDevice> | null;
  facilityName?: string;
  loading?: boolean;
  providers?: { label: string; value: string }[];
  onCancel: () => void;
  onSubmit: (values: FacilityDeviceFormValues) => void | Promise<void>;
}

// Kiểm tra địa chỉ IPv4 hoặc IPv6
function isValidIpAddress(value: string): boolean {
  const ip = value.trim();

  // IPv4
  const parts = ip.split(".");

  if (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255,
    )
  ) {
    return true;
  }

  // IPv6
  if (!/^[0-9a-fA-F:]+$/.test(ip)) return false;

  const doubleColonCount = ip.split("::").length - 1;

  if (doubleColonCount > 1) return false;

  const groups = ip.split(":").filter(Boolean);

  if (!groups.every((group) => /^[0-9a-fA-F]{1,4}$/.test(group))) {
    return false;
  }

  if (doubleColonCount === 1) {
    return groups.length < 8;
  }

  return groups.length === 8;
}

function FacilityDeviceFormModal({
  open,
  mode = "create",
  initialValues,
  facilityName = "",
  loading = false,
  providers = [],
  onCancel,
  onSubmit,
}: FacilityDeviceFormModalProps) {
  const [form] = Form.useForm<FacilityDeviceFormValues>();

  const isEdit = mode === "edit";

  // Reset và khởi tạo dữ liệu khi mở modal
  useEffect(() => {
    if (!open) return;

    form.resetFields();

    if (isEdit && initialValues) {
      form.setFieldsValue({
        name: initialValues.name ?? "",
        ipAddress: initialValues.ipAddress ?? "",
        identifier: initialValues.identifier ?? "",
        password: "",
        provider: initialValues.provider,
        simPhoneNumber: initialValues.simPhoneNumber ?? "",
        simSerial: initialValues.simSerial ?? "",
        tag: initialValues.tag ?? "",
      });
    } else {
      form.setFieldsValue({
        name: "",
        ipAddress: "",
        identifier: "",
        password: "",
        provider: undefined,
        simPhoneNumber: "",
        simSerial: "",
        tag: "",
      });
    }
  }, [open, isEdit, initialValues, form]);

  const handleCancel = () => {
    if (loading) return;
    onCancel();
  };

  // Chuẩn hóa dữ liệu trước khi gửi lên component cha
  const handleSubmit = (values: FacilityDeviceFormValues) => {
    if (loading) return;

    const submitValues: FacilityDeviceFormValues = {
      ...values,
      name: values.name.trim(),
      ipAddress: values.ipAddress.trim(),
      identifier: values.identifier.trim(),
      simPhoneNumber: values.simPhoneNumber?.trim() ?? "",
      simSerial: values.simSerial?.trim() ?? "",
      tag: values.tag?.trim() ?? "",
    };

    // Không gửi mật khẩu nếu người dùng để trống
    if (!submitValues.password) {
      delete submitValues.password;
    }

    return onSubmit(submitValues);
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật thiết bị" : "Thêm mới thiết bị"}
      width={969}
      className="facility-device-form-modal"
      onCancel={handleCancel}
      footer={null}>
      <AppForm<FacilityDeviceFormValues>
        form={form}
        columns={1}
        onFinish={handleSubmit}>
        <div className="facility-device-form-modal__grid">
          {/* Cột bên trái */}
          <div className="facility-device-form-modal__column">
            <Form.Item
              label="Tên thiết bị"
              name="name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập tên thiết bị",
                },
              ]}>
              <AppInput
                width="100%"
                height={44}
                placeholder="Nhập tên thiết bị"
              />
            </Form.Item>

            <Form.Item
              label="Tên đăng nhập (Địa chỉ IP)"
              name="ipAddress"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập địa chỉ IP",
                },
                {
                  validator: async (_, value: string) => {
                    if (!value?.trim()) return;

                    if (!isValidIpAddress(value)) {
                      throw new Error("Địa chỉ IP không đúng định dạng");
                    }
                  },
                },
              ]}>
              <AppInput
                width="100%"
                height={44}
                placeholder="Nhập tên đăng nhập (Địa chỉ IP)"
              />
            </Form.Item>

            <Form.Item
              label="Mã định danh thiết bị"
              name="identifier"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập mã định danh thiết bị",
                },
              ]}>
              <AppInput
                width="100%"
                height={44}
                placeholder="Nhập mã định danh thiết bị"
                readOnly={isEdit}
              />
            </Form.Item>

            {/* Mật khẩu hiển thị ở cả thêm và sửa */}
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: !isEdit,
                  message: "Vui lòng nhập mật khẩu",
                },
                {
                  min: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
              ]}>
              <Input.Password
                size="large"
                placeholder={
                  isEdit ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu"
                }
                autoComplete="new-password"
                className="facility-device-form-modal__password"
              />
            </Form.Item>

            {/* Thông tin bổ sung khi cập nhật */}
            {isEdit && (
              <>
                <Form.Item label="Cơ sở">
                  <Input
                    value={initialValues?.facilityName ?? facilityName}
                    readOnly
                    suffix={<MapPin size={18} color="#F26D21" />}
                    className="facility-device-form-modal__facility"
                  />
                </Form.Item>

                <Form.Item label="Địa chỉ">
                  <AppInput
                    width="100%"
                    height={44}
                    value={initialValues?.address ?? ""}
                    readOnly
                    placeholder="Chưa có dữ liệu địa chỉ"
                  />
                </Form.Item>
              </>
            )}
          </div>

          {/* Cột bên phải */}
          <div className="facility-device-form-modal__column">
            {isEdit && (
              <>
                <Form.Item label="Kinh độ">
                  <AppInput
                    width="100%"
                    height={44}
                    value={initialValues?.longitude ?? ""}
                    readOnly
                    placeholder="Chưa có dữ liệu kinh độ"
                  />
                </Form.Item>

                <Form.Item label="Vĩ độ">
                  <AppInput
                    width="100%"
                    height={44}
                    value={initialValues?.latitude ?? ""}
                    readOnly
                    placeholder="Chưa có dữ liệu vĩ độ"
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              label="Nhà cung cấp"
              name="provider"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhà cung cấp",
                },
              ]}>
              <AppSelect
                width="100%"
                placeholder="Chọn nhà cung cấp"
                options={providers}
              />
            </Form.Item>

            <Form.Item label="Số thuê bao SIM" name="simPhoneNumber">
              <AppInput
                width="100%"
                height={44}
                placeholder="Nhập số thuê bao SIM"
              />
            </Form.Item>

            <Form.Item label="Số seri SIM" name="simSerial">
              <AppInput
                width="100%"
                height={44}
                placeholder="Nhập số seri SIM"
              />
            </Form.Item>

            <Form.Item label="Tag" name="tag">
              <AppInput width="100%" height={44} placeholder="Nhập tag" />
            </Form.Item>
          </div>
        </div>

        {/* Chú thích trường bắt buộc */}
        <div className="facility-device-form-modal__required-note">
          <span>*</span>
          <span>là những trường thông tin bắt buộc</span>
        </div>

        {/* Nút thao tác */}
        <div className="app-form-actions facility-device-form-modal__actions">
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

export default FacilityDeviceFormModal;
