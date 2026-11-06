import { useEffect } from "react";
import { Form } from "antd";

import AppModal from "../../../components/common/AppModal";
import AppForm from "../../../components/common/AppForm";
import AppInput from "../../../components/common/AppInput";
import AppTextArea from "../../../components/common/AppTextArea";
import AppButton from "../../../components/common/AppButton";

import type { DeviceDistributor } from "../types/deviceDistributors.types";

import "./DeviceDistributorModal.css";

export type DeviceDistributorFormValues = Omit<DeviceDistributor, "id">;

interface DeviceDistributorModalProps {
  open: boolean;
  mode: "create" | "edit";
  distributor?: DeviceDistributor | null;
  distributors: DeviceDistributor[];
  onSave: (values: DeviceDistributorFormValues) => void;
  onCancel: () => void;
}

function DeviceDistributorModal({
  open,
  mode,
  distributor,
  distributors,
  onSave,
  onCancel,
}: DeviceDistributorModalProps) {
  const [form] = Form.useForm<DeviceDistributorFormValues>();

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && distributor) {
      form.setFieldsValue({
        code: distributor.code,
        name: distributor.name,
        description: distributor.description,
      });
    } else {
      form.resetFields();
    }
  }, [open, mode, distributor, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      onSave({
        code: values.code.trim(),
        name: values.name.trim(),
        description: (values.description ?? "").trim(),
      });
    } catch {
      // Ant Design Form tự hiển thị lỗi validation.
    }
  };

  return (
    <AppModal
      open={open}
      width={700}
      title={null}
      onCancel={onCancel}
      className="device-distributor-modal"
      footer={
        <div className="device-distributor-modal__footer">
          <AppButton
            variant="outline"
            width={126}
            height={44}
            onClick={onCancel}>
            Hủy
          </AppButton>

          <AppButton
            variant="primary"
            width={126}
            height={44}
            onClick={handleSave}>
            Lưu
          </AppButton>
        </div>
      }>
      <h2 className="device-distributor-modal__title">
        {mode === "create"
          ? "Thêm thông tin nhà phân phối"
          : "Cập nhật thông tin nhà phân phối"}
      </h2>

      <AppForm<DeviceDistributorFormValues>
        form={form}
        layout="vertical"
        requiredMark
        className="device-distributor-modal__form">
        <Form.Item
          label="Mã nhà phân phối"
          name="code"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập mã nhà phân phối",
            },
            {
              validator: async (_, value: string | undefined) => {
                const code = value?.trim().toLowerCase();
                if (!code) return;

                const exists = distributors.some(
                  (item) =>
                    item.code.toLowerCase() === code &&
                    item.id !== distributor?.id,
                );

                if (exists) {
                  throw new Error("Mã nhà phân phối đã tồn tại");
                }
              },
            },
          ]}>
          <AppInput width="100%" placeholder="Nhập tên nhà phân phối" />
        </Form.Item>

        <Form.Item
          label="Tên nhà phân phối"
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập tên nhà phân phối",
            },
          ]}>
          <AppInput width="100%" placeholder="Nhập tên nhà cung cấp" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <AppTextArea width="100%" height={176} placeholder="Nhập mô tả" />
        </Form.Item>
      </AppForm>

      <p className="device-distributor-modal__note">
        <span>*</span> là những trường thông tin bắt buộc
      </p>
    </AppModal>
  );
}

export default DeviceDistributorModal;
