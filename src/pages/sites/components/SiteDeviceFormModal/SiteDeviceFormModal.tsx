import { useEffect } from "react";
import { Form, Input } from "antd";
import { MapPin } from "lucide-react";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import type {
  SiteDevice,
  SiteDeviceFormValues,
} from "../../types/sitedevice.types";

import "./SiteDeviceFormModal.css";

interface SiteDeviceFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<SiteDevice> | null;
  siteName?: string;
  loading?: boolean;
  providers?: { label: string; value: string }[];
  onCancel: () => void;
  onSubmit: (values: SiteDeviceFormValues) => void;
}

function SiteDeviceFormModal({
  open,
  mode = "create",
  initialValues,
  siteName = "",
  loading = false,
  providers = [],
  onCancel,
  onSubmit,
}: SiteDeviceFormModalProps) {
  const [form] = Form.useForm<SiteDeviceFormValues>();

  const isEdit = mode === "edit";

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

  const handleSubmit = (values: SiteDeviceFormValues) => {
    if (loading) return;

    const submitValues: SiteDeviceFormValues = {
      ...values,
      name: values.name.trim(),
      ipAddress: values.ipAddress.trim(),
      identifier: values.identifier.trim(),
      simPhoneNumber: values.simPhoneNumber?.trim() ?? "",
      simSerial: values.simSerial?.trim() ?? "",
      tag: values.tag?.trim() ?? "",
    };

    if (!submitValues.password) {
      delete submitValues.password;
    }

    onSubmit(submitValues);
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật thiết bị" : "Thêm mới thiết bị"}
      width={969}
      className="site-device-form-modal"
      onCancel={handleCancel}
      footer={null}>
      <AppForm<SiteDeviceFormValues>
        form={form}
        columns={1}
        onFinish={handleSubmit}>
        <div className="site-device-form-modal__grid">
          <div className="site-device-form-modal__column">
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
                className="site-device-form-modal__password"
              />
            </Form.Item>

            {isEdit && (
              <>
                <Form.Item label="Cơ sở">
                  <Input
                    value={initialValues?.siteName ?? siteName}
                    readOnly
                    suffix={<MapPin size={18} color="#F26D21" />}
                    className="site-device-form-modal__site"
                  />
                </Form.Item>

                <Form.Item label="Địa chỉ" required>
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

          <div className="site-device-form-modal__column">
            {isEdit && (
              <>
                <Form.Item label="Kinh độ" required>
                  <AppInput
                    width="100%"
                    height={44}
                    value={initialValues?.longitude ?? ""}
                    readOnly
                    placeholder="Chưa có dữ liệu kinh độ"
                  />
                </Form.Item>

                <Form.Item label="Vĩ độ" required>
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

        <div className="site-device-form-modal__required-note">
          <span>*</span>
          <span>là những trường thông tin bắt buộc</span>
        </div>

        <div className="app-form-actions site-device-form-modal__actions">
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

export default SiteDeviceFormModal;
