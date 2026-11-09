import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select } from "antd";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import type { ServicePackage } from "../../../types/package.types";

interface PackageFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<ServicePackage, "id" | "activeSubscribers" | "createdAt" | "updatedAt">) => void;
  editingPackage?: ServicePackage | null;
}

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingPackage,
}) => {
  const [form] = Form.useForm();
  const isEdit = Boolean(editingPackage);

  useEffect(() => {
    if (open) {
      if (editingPackage) {
        form.setFieldsValue({
          name: editingPackage.name,
          code: editingPackage.code,
          storageGB: editingPackage.storageGB,
          maxDevices: editingPackage.maxDevices,
          durationMonths: editingPackage.durationMonths,
          priceVND: editingPackage.priceVND,
          status: editingPackage.status,
          description: editingPackage.description,
          featuresText: editingPackage.features?.join("\n") || "",
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          durationMonths: 12,
          status: "active",
          storageGB: 10,
          maxDevices: 10,
          priceVND: 500000,
        });
      }
    }
  }, [open, editingPackage, form]);

  const handleFinish = (values: Record<string, any>) => {
    const featuresList = values.featuresText
      ? values.featuresText.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : [];

    onSubmit({
      name: values.name,
      code: values.code || `PKG_${Date.now().toString().slice(-4)}`,
      storageGB: Number(values.storageGB) || 0,
      maxDevices: Number(values.maxDevices) || 0,
      durationMonths: Number(values.durationMonths) || 12,
      priceVND: Number(values.priceVND) || 0,
      status: values.status,
      description: values.description || "",
      features: featuresList,
    });
    form.resetFields();
    onClose();
  };

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={680}
      title={isEdit ? "Cập nhật thông tin gói cước" : "Thêm mới gói cước dịch vụ"}
      footer={null}>
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ paddingTop: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Form.Item
            label="Tên gói cước"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói cước" }]}>
            <Input placeholder="Ví dụ: Gói Cơ bản 5GB (1 tháng)" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            label="Mã gói cước"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã gói cước" }]}>
            <Input placeholder="Ví dụ: BASIC_MONTHLY" style={{ height: 40 }} />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
          <Form.Item
            label="Dung lượng (GB)"
            name="storageGB"
            rules={[{ required: true, message: "Vui lòng nhập dung lượng" }]}>
            <InputNumber min={1} max={10000} style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <Form.Item
            label="Số thiết bị tối đa"
            name="maxDevices"
            rules={[{ required: true, message: "Vui lòng nhập số thiết bị" }]}>
            <InputNumber min={1} max={500} style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <Form.Item
            label="Thời hạn"
            name="durationMonths"
            rules={[{ required: true, message: "Vui lòng chọn thời hạn" }]}>
            <Select style={{ height: 40 }}>
              <Select.Option value={1}>1 tháng</Select.Option>
              <Select.Option value={3}>3 tháng (Quý)</Select.Option>
              <Select.Option value={6}>6 tháng</Select.Option>
              <Select.Option value={12}>12 tháng (1 năm)</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Form.Item
            label="Đơn giá (VNĐ)"
            name="priceVND"
            rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}>
            <InputNumber
              min={0}
              step={10000}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, "")) : 0) as any}
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái kinh doanh (SYS-PKG-01)"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
            <Select style={{ height: 40 }}>
              <Select.Option value="active">Đang kinh doanh</Select.Option>
              <Select.Option value="upcoming">Chưa kinh doanh</Select.Option>
              <Select.Option value="suspended">Ngưng kinh doanh</Select.Option>
              <Select.Option value="ended">Đã kết thúc</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item label="Mô tả gói cước" name="description">
          <Input.TextArea rows={2} placeholder="Nhập mô tả chi tiết đối tượng sử dụng..." />
        </Form.Item>

        <Form.Item
          label="Các tính năng đi kèm (mỗi dòng 1 tính năng)"
          name="featuresText">
          <Input.TextArea
            rows={3}
            placeholder="Quản lý thiết bị&#10;Dung lượng media&#10;Lập lịch tự động..."
          />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
          <AppButton variant="outline" width={110} onClick={onClose}>
            Hủy
          </AppButton>
          <AppButton variant="primary" width={160} htmlType="submit">
            {isEdit ? "Cập nhật" : "Tạo gói cước"}
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
};

export default PackageFormModal;
