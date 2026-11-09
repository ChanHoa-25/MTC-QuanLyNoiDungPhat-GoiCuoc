import React, { useEffect } from "react";
import { Form, Input, Checkbox, message } from "antd";
import { CreditCard, Lock, Calendar, ShieldCheck } from "lucide-react";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import { usePackages } from "../../../contexts/PackageContext";

interface CardPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export const CardPaymentModal: React.FC<CardPaymentModalProps> = ({ open, onClose }) => {
  const { savedCard, saveCardInfo } = usePackages();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (savedCard) {
        form.setFieldsValue({
          cardNumber: savedCard.cardNumber,
          cardHolder: savedCard.cardHolder,
          expiryDate: savedCard.expiryDate,
          cvv: savedCard.cvv,
          isDefault: savedCard.isDefault,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isDefault: true });
      }
    }
  }, [open, savedCard, form]);

  const handleSubmit = (values: Record<string, any>) => {
    saveCardInfo({
      cardNumber: values.cardNumber,
      cardHolder: values.cardHolder.toUpperCase(),
      expiryDate: values.expiryDate,
      cvv: values.cvv,
      isDefault: Boolean(values.isDefault),
    });
    message.success("Lưu thông tin thẻ thanh toán thành công!");
    onClose();
  };

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={520}
      title="Thông tin thẻ thanh toán quốc tế"
      footer={null}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ paddingTop: 10 }}>
        {/* Mock visual card */}
        <div
          style={{
            background: "linear-gradient(135deg, #FF7506 0%, #FA541C 100%)",
            borderRadius: 12,
            padding: "18px 22px",
            color: "#FFFFFF",
            marginBottom: 20,
            boxShadow: "0 6px 16px rgba(255, 117, 6, 0.25)",
          }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", opacity: 0.9 }}>
              Thẻ ghi nợ / Tín dụng
            </span>
            <CreditCard size={28} />
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>
            {form.getFieldValue("cardNumber") || "**** **** **** 8826"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <div>
              <div style={{ opacity: 0.7, fontSize: 10 }}>CHỦ THẺ</div>
              <strong style={{ letterSpacing: 1 }}>
                {form.getFieldValue("cardHolder") || "NGUYEN VAN CHINH"}
              </strong>
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: 10 }}>HẾT HẠN</div>
              <strong>{form.getFieldValue("expiryDate") || "12/28"}</strong>
            </div>
          </div>
        </div>

        <Form.Item
          label="Số thẻ (16 chữ số)"
          name="cardNumber"
          rules={[{ required: true, message: "Vui lòng nhập số thẻ" }]}>
          <Input
            prefix={<CreditCard size={16} color="#8C8C8C" />}
            placeholder="4111 2222 3333 4444"
            maxLength={19}
            style={{ height: 42 }}
          />
        </Form.Item>

        <Form.Item
          label="Tên in trên thẻ (không dấu)"
          name="cardHolder"
          rules={[{ required: true, message: "Vui lòng nhập tên chủ thẻ" }]}>
          <Input placeholder="NGUYEN VAN A" style={{ height: 42, textTransform: "uppercase" }} />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Form.Item
            label="Ngày hết hạn (MM/YY)"
            name="expiryDate"
            rules={[{ required: true, message: "Vui lòng nhập MM/YY" }]}>
            <Input
              prefix={<Calendar size={16} color="#8C8C8C" />}
              placeholder="12/28"
              maxLength={5}
              style={{ height: 42 }}
            />
          </Form.Item>

          <Form.Item
            label="Mã bảo mật (CVV/CVC)"
            name="cvv"
            rules={[{ required: true, message: "Vui lòng nhập CVV" }]}>
            <Input.Password
              prefix={<Lock size={16} color="#8C8C8C" />}
              placeholder="123"
              maxLength={4}
              style={{ height: 42 }}
            />
          </Form.Item>
        </div>

        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm phương thức thanh toán mặc định cho gia hạn tự động</Checkbox>
        </Form.Item>

        <div
          style={{
            background: "#F6FFED",
            border: "1px solid #B7EB8F",
            borderRadius: 6,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "#389E0D",
            marginBottom: 20,
          }}>
          <ShieldCheck size={16} />
          <span>Thông tin thẻ được mã hóa theo tiêu chuẩn an toàn bảo mật PCI-DSS.</span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <AppButton variant="outline" width={110} onClick={onClose}>
            Hủy
          </AppButton>
          <AppButton variant="primary" width={160} htmlType="submit">
            Lưu thông tin thẻ
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
};

export default CardPaymentModal;
