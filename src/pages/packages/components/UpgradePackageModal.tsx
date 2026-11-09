import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select } from "antd";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import type { UpgradePackage } from "../../../types/package.types";

interface UpgradePackageModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<UpgradePackage, "id" | "purchasedCount" | "createdAt">) => void;
  editingUpgrade?: UpgradePackage | null;
}

export const UpgradePackageModal: React.FC<UpgradePackageModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingUpgrade,
}) => {
  const [form] = Form.useForm();
  const isEdit = Boolean(editingUpgrade);

  useEffect(() => {
    if (open) {
      if (editingUpgrade) {
        form.setFieldsValue({
          name: editingUpgrade.name,
          code: editingUpgrade.code,
          extraStorageGB: editingUpgrade.extraStorageGB,
          extraDevices: editingUpgrade.extraDevices,
          priceVND: editingUpgrade.priceVND,
          status: editingUpgrade.status,
          description: editingUpgrade.description,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          extraStorageGB: 10,
          extraDevices: 0,
          priceVND: 250000,
          status: "selling",
        });
      }
    }
  }, [open, editingUpgrade, form]);

  const handleFinish = (values: Record<string, any>) => {
    onSubmit({
      name: values.name,
      code: values.code || `UPG_${Date.now().toString().slice(-4)}`,
      extraStorageGB: Number(values.extraStorageGB) || 0,
      extraDevices: Number(values.extraDevices) || 0,
      priceVND: Number(values.priceVND) || 0,
      status: values.status,
      description: values.description || "",
    });
    form.resetFields();
    onClose();
  };

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={600}
      title={isEdit ? "Cập nhật gói nâng cấp (SYS-UPG-01)" : "Thêm gói nâng cấp bổ sung"}
      footer={null}>
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ paddingTop: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Form.Item
            label="Tên gói nâng cấp"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói nâng cấp" }]}>
            <Input placeholder="Ví dụ: Gói Mở rộng Dung lượng +10GB" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            label="Mã gói"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã gói" }]}>
            <Input placeholder="Ví dụ: EXTRA_STORAGE_10GB" style={{ height: 40 }} />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Form.Item label="Dung lượng bổ sung (+GB)" name="extraStorageGB">
            <InputNumber min={0} max={1000} style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <Form.Item label="Thiết bị bổ sung (+thiết bị)" name="extraDevices">
            <InputNumber min={0} max={100} style={{ width: "100%", height: 40 }} />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Form.Item
            label="Giá bán (VNĐ)"
            name="priceVND"
            rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}>
            <InputNumber
              min={0}
              step={10000}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, "")) : 0) as any}
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái mở bán"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
            <Select style={{ height: 40 }}>
              <Select.Option value="selling">Đang mở bán</Select.Option>
              <Select.Option value="closed">Đã đóng</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item label="Mô tả công dụng gói nâng cấp" name="description">
          <Input.TextArea rows={2} placeholder="Nhập mô tả chi tiết..." />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
          <AppButton variant="outline" width={110} onClick={onClose}>
            Hủy
          </AppButton>
          <AppButton variant="primary" width={160} htmlType="submit">
            {isEdit ? "Cập nhật" : "Lưu gói nâng cấp"}
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
};

export default UpgradePackageModal;
