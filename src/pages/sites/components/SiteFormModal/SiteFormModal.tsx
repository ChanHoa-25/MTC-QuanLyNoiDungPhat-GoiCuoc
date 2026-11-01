import { useEffect } from "react";
import { Form } from "antd";

import AppModal from "../../../../components/common/AppModal";
import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppButton from "../../../../components/common/AppButton";

import "./SiteFormModal.css";

export interface SiteFormValues {
  name: string;
  code: string;
  parentName: string;
  category: string;
}

interface SiteFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<SiteFormValues>;
  categoryOptions: { label: string; value: string }[];
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: SiteFormValues) => void;
}

function SiteFormModal({
  open,
  mode = "create",
  initialValues,
  categoryOptions,
  loading = false,
  onCancel,
  onSubmit,
}: SiteFormModalProps) {
  const [form] = Form.useForm<SiteFormValues>();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    form.setFieldsValue({
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      parentName: initialValues?.parentName ?? "",
      category: initialValues?.category ?? "",
    });
  }, [
    open,
    mode,
    form,
    initialValues?.name,
    initialValues?.code,
    initialValues?.parentName,
    initialValues?.category,
  ]);

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật thông tin cơ sở" : "Thêm cơ sở trực thuộc"}
      width={524}
      className="site-form-modal"
      onCancel={onCancel}
      footer={null}>
      <AppForm<SiteFormValues> form={form} columns={1} onFinish={onSubmit}>
        <Form.Item
          label="Tên cơ sở"
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập tên cơ sở",
            },
          ]}>
          <AppInput width="100%" height={44} placeholder="Nhập tên cơ sở" />
        </Form.Item>

        <Form.Item
          label="Mã cơ sở"
          name="code"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập mã cơ sở",
            },
          ]}>
          <AppInput width="100%" height={44} placeholder="Nhập mã cơ sở" />
        </Form.Item>

        <Form.Item label="Cơ sở trực thuộc" name="parentName">
          <AppInput
            width="100%"
            height={44}
            readOnly
            placeholder="Cơ sở cấp trên"
            className="site-form-modal__readonly"
          />
        </Form.Item>

        <Form.Item
          label="Phân loại cơ sở"
          name="category"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn phân loại cơ sở",
            },
          ]}>
          <AppSelect
            width="100%"
            placeholder="Chọn phân loại cơ sở"
            options={categoryOptions}
          />
        </Form.Item>

        <div className="site-form-modal__required-note">
          <span>*</span> là những trường thông tin bắt buộc
        </div>

        <div className="app-form-actions site-form-modal__actions">
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

export default SiteFormModal;
