import { useEffect } from "react";
import { Form, Input, Radio } from "antd";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import type {
  FacilityDevice,
  FacilityDeviceFormValues,
  DeviceLocationMode,
} from "../../types/facilityDevice.types";

import "./FacilityDeviceFormModal.css";

interface FacilityDeviceFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<FacilityDevice> | null;
  facilityName?: string;
  loading?: boolean;
  providers?: { label: string; value: string }[];
  deviceGroups?: { label: string; value: string }[];
  onCancel: () => void;
  onSubmit: (values: FacilityDeviceFormValues) => void | Promise<void>;
}

function FacilityDeviceFormModal({
  open,
  mode = "create",
  initialValues,
  loading = false,
  providers = [],
  deviceGroups = [],
  onCancel,
  onSubmit,
}: FacilityDeviceFormModalProps) {
  const [form] = Form.useForm<FacilityDeviceFormValues>();

  const isEdit = mode === "edit";

  const locationMode = Form.useWatch("locationMode", form);

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    form.setFieldsValue({
      name: isEdit ? (initialValues?.name ?? "") : "",
      identifier: isEdit ? (initialValues?.identifier ?? "") : "",
      activityStatus: isEdit
        ? (initialValues?.activityStatus ?? "active")
        : "active",
      deviceGroup: isEdit ? initialValues?.deviceGroup : undefined,
      provider: isEdit ? (initialValues?.provider ?? "") : "",
      simSerial: isEdit ? (initialValues?.simSerial ?? "") : "",
      simPhoneNumber: isEdit ? (initialValues?.simPhoneNumber ?? "") : "",
      width: isEdit ? initialValues?.width : undefined,
      height: isEdit ? initialValues?.height : undefined,
      locationMode: isEdit
        ? (initialValues?.locationMode ?? "manual")
        : "manual",
      longitude: isEdit ? (initialValues?.longitude ?? "") : "",
      latitude: isEdit ? (initialValues?.latitude ?? "") : "",
      description: isEdit ? (initialValues?.description ?? "") : "",
    });
  }, [open, isEdit, initialValues, form]);

  const handleSubmit = (values: FacilityDeviceFormValues) => {
    if (loading) return;

    const submitValues: FacilityDeviceFormValues = {
      ...values,
      name: values.name.trim(),
      identifier: values.identifier.trim(),
      simSerial: values.simSerial?.trim() ?? "",
      simPhoneNumber: values.simPhoneNumber?.trim() ?? "",
      description: values.description?.trim() ?? "",
      longitude:
        values.locationMode === "manual" ? values.longitude?.trim() : undefined,
      latitude:
        values.locationMode === "manual" ? values.latitude?.trim() : undefined,
    };

    return onSubmit(submitValues);
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật thiết bị" : "Thêm mới thiết bị"}
      width={969}
      className="facility-device-form-modal"
      onCancel={onCancel}
      footer={null}>
      <AppForm<FacilityDeviceFormValues>
        form={form}
        columns={1}
        onFinish={handleSubmit}>
        <div className="facility-device-form-modal__grid">
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

            <Form.Item label="Nhóm thiết bị" name="deviceGroup">
              <AppSelect
                width="100%"
                placeholder="Chọn nhóm thiết bị"
                options={deviceGroups}
              />
            </Form.Item>

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

            <Form.Item
              label="Số seri SIM"
              name="simSerial"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập số seri SIM",
                },
              ]}>
              <AppInput
                width="100%"
                height={44}
                placeholder="Nhập số seri SIM"
              />
            </Form.Item>

            <Form.Item
              label="Số thuê bao SIM"
              name="simPhoneNumber"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập số thuê bao SIM",
                },
              ]}>
              <AppInput
                width="100%"
                height={44}
                placeholder="Nhập số thuê bao SIM"
              />
            </Form.Item>
          </div>

          <div className="facility-device-form-modal__column">
            <Form.Item
              label="Trạng thái hoạt động"
              name="activityStatus"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái",
                },
              ]}>
              <AppSelect
                width="100%"
                options={[
                  { label: "Khả dụng", value: "active" },
                  { label: "Không khả dụng", value: "inactive" },
                ]}
              />
            </Form.Item>

            <div className="facility-device-form-modal__row">
              <Form.Item
                label="Chiều ngang"
                name="width"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập chiều ngang",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Chiều ngang phải lớn hơn 0",
                  },
                ]}
                getValueFromEvent={(event) => {
                  const value = event.target.value;
                  return value === "" ? undefined : Number(value);
                }}>
                <AppInput
                  width="100%"
                  height={44}
                  type="number"
                  min={1}
                  placeholder="Chiều ngang"
                />
              </Form.Item>

              <Form.Item
                label="Chiều cao"
                name="height"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập chiều cao",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Chiều cao phải lớn hơn 0",
                  },
                ]}
                getValueFromEvent={(event) => {
                  const value = event.target.value;
                  return value === "" ? undefined : Number(value);
                }}>
                <AppInput
                  width="100%"
                  height={44}
                  type="number"
                  min={1}
                  placeholder="Chiều cao"
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Vị trí thiết bị"
              name="locationMode"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn vị trí thiết bị",
                },
              ]}>
              <Radio.Group className="facility-device-form-modal__radio-group">
                <Radio value="gps">Nhận từ GPS thiết bị</Radio>
                <Radio value="manual">Nhập tọa độ</Radio>
              </Radio.Group>
            </Form.Item>

            <div className="facility-device-form-modal__row">
              <Form.Item
                label="Kinh độ"
                name="longitude"
                rules={[
                  {
                    required: locationMode === "manual",
                    message: "Vui lòng nhập kinh độ",
                  },
                  {
                    validator: async (_, value?: string) => {
                      if (!value || locationMode !== "manual") return;

                      const number = Number(value);

                      if (
                        !Number.isFinite(number) ||
                        number < -180 ||
                        number > 180
                      ) {
                        throw new Error("Kinh độ phải từ -180 đến 180");
                      }
                    },
                  },
                ]}>
                <AppInput
                  width="100%"
                  height={44}
                  placeholder="Nhập kinh độ"
                  disabled={locationMode === "gps"}
                />
              </Form.Item>

              <Form.Item
                label="Vĩ độ"
                name="latitude"
                rules={[
                  {
                    required: locationMode === "manual",
                    message: "Vui lòng nhập vĩ độ",
                  },
                  {
                    validator: async (_, value?: string) => {
                      if (!value || locationMode !== "manual") return;

                      const number = Number(value);

                      if (
                        !Number.isFinite(number) ||
                        number < -90 ||
                        number > 90
                      ) {
                        throw new Error("Vĩ độ phải từ -90 đến 90");
                      }
                    },
                  },
                ]}>
                <AppInput
                  width="100%"
                  height={44}
                  placeholder="Nhập vĩ độ"
                  disabled={locationMode === "gps"}
                />
              </Form.Item>
            </div>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                className="facility-device-form-modal__textarea"
                placeholder="Nhập mô tả"
                rows={4}
              />
            </Form.Item>
          </div>
        </div>

        <div className="facility-device-form-modal__required-note">
          <span>*</span>
          <span>là những trường thông tin bắt buộc</span>
        </div>

        <div className="app-form-actions facility-device-form-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            height={44}
            disabled={loading}
            onClick={onCancel}>
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
