import { useEffect } from "react";
import { Form } from "antd";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import type {
  FacilityFormValues,
  FacilityFormMode,
} from "../../types/facility.types";

import "./FacilityFormModal.css";

// Các trường bổ sung để hiển thị trên form
interface FacilityModalFormValues extends FacilityFormValues {
  parentName: string;
}

interface FacilityFormModalProps {
  open: boolean;
  mode?: FacilityFormMode;
  initialValues?: Partial<FacilityModalFormValues>;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: FacilityFormValues) => void;
}

// Danh sách trạng thái hoạt động
const facilityStatusOptions = [
  { label: "Đang hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
];

function FacilityFormModal({
  open,
  mode = "create",
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: FacilityFormModalProps) {
  const [form] = Form.useForm<FacilityModalFormValues>();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    form.setFieldsValue({
      facilityName: initialValues?.facilityName ?? "",
      facilityCode: initialValues?.facilityCode ?? "",
      isActive: initialValues?.isActive ?? true,
      parentName: initialValues?.parentName ?? "",
    });
  }, [
    open,
    mode,
    form,
    initialValues?.facilityName,
    initialValues?.facilityCode,
    initialValues?.isActive,
    initialValues?.parentName,
  ]);

  const handleFinish = (values: FacilityModalFormValues) => {
    onSubmit({
      facilityName: values.facilityName,
      facilityCode: values.facilityCode,
      isActive: values.isActive,
    });
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật thông tin cơ sở" : "Thêm cơ sở trực thuộc"}
      width={524}
      className="facility-form-modal"
      onCancel={onCancel}
      footer={null}>
      <AppForm<FacilityModalFormValues>
        form={form}
        columns={1}
        onFinish={handleFinish}>
        {/* Tên cơ sở */}
        <Form.Item
          label="Tên cơ sở"
          name="facilityName"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập tên cơ sở",
            },
          ]}>
          <AppInput width="100%" height={44} placeholder="Nhập tên cơ sở" />
        </Form.Item>

        {/* Mã cơ sở */}
        <Form.Item
          label="Mã cơ sở"
          name="facilityCode"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập mã cơ sở",
            },
          ]}>
          <AppInput width="100%" height={44} placeholder="Nhập mã cơ sở" />
        </Form.Item>

        {/* Cơ sở trực thuộc */}
        <Form.Item label="Cơ sở trực thuộc" name="parentName">
          <AppInput
            width="100%"
            height={44}
            readOnly
            placeholder="Cơ sở cấp trên"
            className="facility-form-modal__readonly"
          />
        </Form.Item>

        {/* Trạng thái hoạt động */}
        <Form.Item
          label="Trạng thái hoạt động"
          name="isActive"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn trạng thái hoạt động",
            },
          ]}
          getValueProps={(value: boolean) => ({
            value: value ? "active" : "inactive",
          })}
          getValueFromEvent={(value: string) => value === "active"}>
          <AppSelect
            width="100%"
            placeholder="Chọn trạng thái hoạt động"
            options={facilityStatusOptions}
          />
        </Form.Item>

        {/* Ghi chú trường bắt buộc */}
        <div className="facility-form-modal__required-note">
          <span>*</span> là những trường thông tin bắt buộc
        </div>

        {/* Nút thao tác */}
        <div className="app-form-actions facility-form-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            height={44}
            onClick={onCancel}>
            Hủy
          </AppButton>

          <AppButton
            width={120}
            height={44}
            htmlType="submit"
            loading={loading}>
            {isEdit ? "Cập nhật" : "Thêm mới"}
          </AppButton>
        </div>
      </AppForm>
    </AppModal>
  );
}

export default FacilityFormModal;
