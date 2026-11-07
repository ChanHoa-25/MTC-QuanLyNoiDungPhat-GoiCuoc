import { useState } from "react";
import AppModal from "../../../../components/common/AppModal";
import AppButton from "../../../../components/common/AppButton";
import AppInput from "../../../../components/common/AppInput";
import "./AddZoneModal.css";

interface AddZoneModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (widthPercent: number, heightPercent: number) => void;
}

export default function AddZoneModal({
  open,
  onCancel,
  onConfirm,
}: AddZoneModalProps) {
  const [height, setHeight] = useState<string>("50");
  const [width, setWidth] = useState<string>("50");

  const handleSubmit = () => {
    const h = Number(height) || 50;
    const w = Number(width) || 50;
    onConfirm(Math.min(100, Math.max(10, w)), Math.min(100, Math.max(10, h)));
    onCancel();
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      width={440}
      title={<div className="add-zone-modal__title">Thêm ô mới</div>}
      footer={null}
    >
      <div className="add-zone-modal__content">
        <label className="add-zone-modal__label">
          Tỷ lệ màn hình<span className="add-zone-modal__required">*</span>
        </label>
        <div className="add-zone-modal__inputs">
          <AppInput
            placeholder="Chiều cao (%)"
            value={height}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeight(e.target.value)}
            type="number"
          />
          <AppInput
            placeholder="Chiều ngang (%)"
            value={width}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidth(e.target.value)}
            type="number"
          />
        </div>
        <p className="add-zone-modal__hint">
          <span className="add-zone-modal__required">*</span> là những trường thông tin bắt buộc
        </p>

        <div className="add-zone-modal__actions">
          <AppButton variant="outline" onClick={onCancel} width={120}>
            Hủy bỏ
          </AppButton>
          <AppButton variant="primary" onClick={handleSubmit} width={120}>
            Xác nhận
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}
