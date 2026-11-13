import { useEffect, useState } from "react";
import { X } from "lucide-react";

import AppButton from "../../../../../components/common/AppButton";
import AppModal from "../../../../../components/common/AppModal";

import "./SourceMediaRejectModal.css";

interface SourceMediaRejectModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

function SourceMediaRejectModal({
  open,
  onCancel,
  onConfirm,
}: SourceMediaRejectModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  return (
    <AppModal
      open={open}
      width={500}
      onCancel={onCancel}
      footer={null}
      closable={false}
      maskClosable={false}
      destroyOnHidden
      className="source-media-reject-modal">
      <div className="source-media-reject-modal__icon">
        <X size={42} strokeWidth={2} />
      </div>

      <div className="source-media-reject-modal__body">
        <h2 className="source-media-reject-modal__title">
          Xác nhận từ chối duyệt media
        </h2>

        <p className="source-media-reject-modal__subtitle">
          Bạn có chắc chắn muốn từ chối duyệt media này không?
        </p>

        <div className="source-media-reject-modal__field">
          <label
            htmlFor="reject-media-reason"
            className="source-media-reject-modal__label">
            Lý do từ chối:
          </label>

          <textarea
            id="reject-media-reason"
            className="source-media-reject-modal__textarea"
            placeholder="Nhập lý do"
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        <div className="source-media-reject-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            className="source-media-reject-modal__cancel"
            onClick={onCancel}>
            Hủy
          </AppButton>

          <AppButton
            variant="primary"
            width={120}
            className="source-media-reject-modal__confirm"
            onClick={handleConfirm}>
            Xác nhận
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

export default SourceMediaRejectModal;
