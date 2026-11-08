import AppConfirmModal from "../../../../components/common/AppConfirmModal";

interface DeleteTemplateModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  count?: number;
}

export default function DeleteTemplateModal({
  open,
  onCancel,
  onConfirm,
  count = 1,
}: DeleteTemplateModalProps) {
  return (
    <AppConfirmModal
      open={open}
      type="delete"
      title="Xác nhận xóa bản mẫu"
      description={
        count > 1
          ? `Các bản mẫu được chọn (${count} bản mẫu) sẽ bị xóa khỏi hệ thống và không thể khôi phục.`
          : "Bản mẫu được chọn sẽ bị xóa khỏi hệ thống và không thể khôi phục."
      }
      confirmText="Tiếp tục"
      cancelText="Hủy"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

