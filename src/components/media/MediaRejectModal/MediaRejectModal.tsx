import { useEffect, useState } from "react";
import { X } from "lucide-react";

import AppConfirmModal from "../../common/AppConfirmModal";
import AppTextArea from "../../common/AppTextArea";

import "./MediaRejectModal.css";

interface MediaRejectModalProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

function MediaRejectModal({
  open,
  loading = false,
  onCancel,
  onConfirm,
}: MediaRejectModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason || loading) return;

    void onConfirm(trimmedReason);
  };

  const handleCancel = () => {
    if (loading) return;

    onCancel();
  };

  return (
    <AppConfirmModal
      open={open}
      type="delete"
      title="Xác nhận từ chối duyệt media"
      description={
        <div className="media-reject-modal__body">
          <p className="media-reject-modal__message">
            Bạn có chắc chắn muốn từ chối duyệt media này không?
          </p>

          <div className="media-reject-modal__field">
            <label htmlFor="media-reject-reason">Lý do từ chối:</label>

            <AppTextArea
              id="media-reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do"
              width="100%"
              height={143}
              maxLength={1000}
              disabled={loading}
            />
          </div>
        </div>
      }
      icon={<X size={42} strokeWidth={2} />}
      confirmText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
      confirmDisabled={!reason.trim() || loading}
      width={500}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      className="media-reject-modal"
    />
  );
}

export default MediaRejectModal;
